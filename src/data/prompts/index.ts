// @ts-nocheck
// Central prompt registry and management system
// Optimized for 30+ prompts with efficient lookup and lazy loading

export interface QuestionPrompt {
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  version?: string;
  lastUpdated?: string;
}

// Efficient lookup using Map for O(1) access
const PROMPT_MAP = new Map<string, QuestionPrompt[]>();
const PROMPT_ROTATION_INDEX = new Map<string, number>();

// Registry of all available prompts (lazy loaded)
const PROMPT_REGISTRY: Record<string, () => Promise<QuestionPrompt[]>> = {
  'information-and-ideas': () => import('./domains/informationAndIdeas').then(m => m.prompts),
  'craft-and-structure': () => import('./domains/craftAndStructure').then(m => m.prompts),
  'expression-of-ideas': () => import('./domains/expressionOfIdeas').then(m => m.prompts),
  'standard-english-conventions': () => import('./domains/standardEnglishConventions').then(m => m.prompts),
  algebra: () => import('./domains/algebra').then(m => m.prompts),
  'advanced-math': () => import('./domains/advancedMath').then(m => m.prompts),
};

// Initialize the system
let isInitialized = false;

async function initializePrompts(): Promise<void> {
  if (isInitialized) return;
  
  console.log('🔄 Initializing prompt system...');
  
  // Load all domain prompts
  for (const [domain, loader] of Object.entries(PROMPT_REGISTRY)) {
    try {
      const prompts = await loader();
      prompts.forEach(prompt => {
        const key = generateKey(prompt.skill, prompt.domain, prompt.difficulty);
        console.log('🧾 Registering prompt:', { key, skill: prompt.skill, domain: prompt.domain, difficulty: prompt.difficulty });
        const existing = PROMPT_MAP.get(key) || [];
        existing.push(prompt);
        PROMPT_MAP.set(key, existing);
        if (!PROMPT_ROTATION_INDEX.has(key)) {
          PROMPT_ROTATION_INDEX.set(key, 0);
        }
      });
    } catch (error) {
      console.error(`Failed to load prompts for domain: ${domain}`, error);
    }
  }
  
  isInitialized = true;
  console.log(`✅ Prompt system initialized with ${PROMPT_MAP.size} prompts`);
}

// Generate consistent key for prompt lookup
function generateKey(skill: string, domain: string, difficulty: string): string {
  return `${skill.toLowerCase().replace(/\s+/g, '-')}-${domain.toLowerCase().replace(/\s+/g, '-')}-${difficulty}`;
}

// Main function to get prompt (with caching)
export async function getPrompt(
  skill: string, 
  domain: string, 
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<string | null> {
  await initializePrompts();
  
  const key = generateKey(skill, domain, difficulty);
  const promptList = PROMPT_MAP.get(key);

  if (!promptList || promptList.length === 0) {
    return null;
  }

  const nextIndex = PROMPT_ROTATION_INDEX.get(key) ?? 0;
  const prompt = promptList[nextIndex % promptList.length];
  PROMPT_ROTATION_INDEX.set(key, (nextIndex + 1) % promptList.length);

  return prompt.prompt;
}

// Check if prompt exists (O(1) lookup)
export async function hasPrompt(
  skill: string, 
  domain: string, 
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<boolean> {
  await initializePrompts();
  const key = generateKey(skill, domain, difficulty);
  return PROMPT_MAP.has(key);
}

function getAllPrompts(): QuestionPrompt[] {
  const results: QuestionPrompt[] = [];
  for (const list of PROMPT_MAP.values()) {
    results.push(...list);
  }
  return results;
}

// Get all available skills (cached)
let skillsCache: string[] | null = null;
export async function getAvailableSkills(): Promise<string[]> {
  if (skillsCache) return skillsCache;
  
  await initializePrompts();
  const prompts = getAllPrompts();
  skillsCache = [...new Set(prompts.map(p => p.skill))];
  return skillsCache;
}

// Get all available domains (cached)
let domainsCache: string[] | null = null;
export async function getAvailableDomains(): Promise<string[]> {
  if (domainsCache) return domainsCache;
  
  await initializePrompts();
  const prompts = getAllPrompts();
  domainsCache = [...new Set(prompts.map(p => p.domain))];
  return domainsCache;
}

// Get difficulties for specific skill/domain
export async function getAvailableDifficulties(
  skill: string, 
  domain: string
): Promise<('easy' | 'medium' | 'hard')[]> {
  await initializePrompts();
  
  const difficulties = getAllPrompts()
    .filter(p => p.skill === skill && p.domain === domain)
    .map(p => p.difficulty)
    .sort((a, b) => {
      const order = { easy: 0, medium: 1, hard: 2 };
      return order[a] - order[b];
    });
  
  return difficulties;
}

// Validate AI generation availability
export async function isAIGenerationAvailable(
  skill: string, 
  domain: string, 
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<boolean> {
  return await hasPrompt(skill, domain, difficulty);
}

// Get prompt statistics
export async function getPromptStats(): Promise<{
  totalPrompts: number;
  skillsCount: number;
  domainsCount: number;
  promptsByDomain: Record<string, number>;
}> {
  await initializePrompts();
  
  const prompts = getAllPrompts();
  const domains = [...new Set(prompts.map(p => p.domain))];
  
  const promptsByDomain = domains.reduce((acc, domain) => {
    acc[domain] = prompts.filter(p => p.domain === domain).length;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalPrompts: prompts.length,
    skillsCount: new Set(prompts.map(p => p.skill)).size,
    domainsCount: domains.length,
    promptsByDomain
  };
}

// Clear cache (useful for development)
export function clearCache(): void {
  PROMPT_MAP.clear();
  PROMPT_ROTATION_INDEX.clear();
  skillsCache = null;
  domainsCache = null;
  isInitialized = false;
}

// Preload specific domain (for performance optimization)
export async function preloadDomain(domain: string): Promise<void> {
  const domainKey = domain.toLowerCase().replace(/\s+/g, '-');
  if (PROMPT_REGISTRY[domainKey]) {
    await PROMPT_REGISTRY[domainKey]();
  }
}

// Export types for use in other files
export type { QuestionPrompt };
