// Mastery caching service for instant loading
// Caches domain-skill mappings and preloads mastery data

import { supabase } from '@/integrations/supabase/client';

interface DomainSkillMapping {
  domain: string;
  subject: 'math' | 'english';
}

interface CachedDomainMappings {
  mappings: Map<string, DomainSkillMapping>;
  timestamp: number;
}

const DOMAIN_MAPPINGS_CACHE_KEY = 'mastery-domain-mappings';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (domain mappings don't change often)

/**
 * Get cached domain-skill mappings
 */
export const getCachedDomainMappings = (): Map<string, DomainSkillMapping> | null => {
  try {
    const cached = localStorage.getItem(DOMAIN_MAPPINGS_CACHE_KEY);
    
    if (cached) {
      const parsed: CachedDomainMappings = JSON.parse(cached);
      const cacheAge = Date.now() - parsed.timestamp;
      
      if (cacheAge < CACHE_DURATION) {
        console.log('🚀 Loading domain mappings from cache (instant)');
        // Convert array back to Map
        const map = new Map<string, DomainSkillMapping>();
        parsed.mappings.forEach(([key, value]) => {
          map.set(key, value);
        });
        return map;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached domain mappings:', error);
  }
  
  return null;
};

/**
 * Cache domain-skill mappings
 */
export const cacheDomainMappings = (mappings: Map<string, DomainSkillMapping>): void => {
  try {
    // Convert Map to array for JSON serialization
    const mappingsArray = Array.from(mappings.entries());
    const data: CachedDomainMappings = {
      mappings: mappingsArray,
      timestamp: Date.now()
    };
    
    localStorage.setItem(DOMAIN_MAPPINGS_CACHE_KEY, JSON.stringify(data));
    console.log('💾 Cached domain mappings');
  } catch (error) {
    console.warn('Failed to cache domain mappings:', error);
  }
};

/**
 * Preload domain-skill mappings (called on app start)
 */
export const preloadDomainMappings = async (): Promise<Map<string, DomainSkillMapping>> => {
  // Check cache first
  const cached = getCachedDomainMappings();
  if (cached) {
    return cached;
  }

  // Load from database
  const map = new Map<string, DomainSkillMapping>();
  
  try {
    // Load Math domains - fetch all rows without limit
    let mathData: any[] = [];
    let mathOffset = 0;
    const mathPageSize = 1000;
    let hasMoreMath = true;
    
    while (hasMoreMath) {
      const { data, error } = await supabase
        .from('question_bank')
        .select('skill, domain')
        .eq('assessment', 'SAT')
        .eq('test', 'Math')
        .not('skill', 'is', null)
        .not('domain', 'is', null)
        .range(mathOffset, mathOffset + mathPageSize - 1);
      
      if (error) {
        console.error('Error loading Math skills:', error);
        break;
      }
      
      if (data && data.length > 0) {
        mathData = [...mathData, ...data];
        mathOffset += mathPageSize;
        hasMoreMath = data.length === mathPageSize;
      } else {
        hasMoreMath = false;
      }
    }
    
    // Process Math skills - group by skill to get unique skills with their domains
    const mathSkillMap = new Map<string, string>();
    mathData.forEach(row => {
      if (row.skill && row.domain) {
        // Keep the first domain encountered for each skill (or you could track all domains)
        if (!mathSkillMap.has(row.skill)) {
          mathSkillMap.set(row.skill, row.domain);
        }
      }
    });
    
    mathSkillMap.forEach((domain, skill) => {
      map.set(skill, { domain, subject: 'math' });
    });
    
    // Load Reading and Writing domains - fetch all rows without limit
    let rwData: any[] = [];
    let rwOffset = 0;
    const rwPageSize = 1000;
    let hasMoreRW = true;
    
    while (hasMoreRW) {
      const { data, error } = await supabase
        .from('question_bank')
        .select('skill, domain')
        .eq('assessment', 'SAT')
        .eq('test', 'Reading and Writing')
        .not('skill', 'is', null)
        .not('domain', 'is', null)
        .range(rwOffset, rwOffset + rwPageSize - 1);
      
      if (error) {
        console.error('Error loading Reading and Writing skills:', error);
        break;
      }
      
      if (data && data.length > 0) {
        rwData = [...rwData, ...data];
        rwOffset += rwPageSize;
        hasMoreRW = data.length === rwPageSize;
      } else {
        hasMoreRW = false;
      }
    }
    
    // Process Reading and Writing skills - group by skill to get unique skills with their domains
    const rwSkillMap = new Map<string, string>();
    rwData.forEach(row => {
      if (row.skill && row.domain) {
        // Keep the first domain encountered for each skill
        if (!rwSkillMap.has(row.skill)) {
          rwSkillMap.set(row.skill, row.domain);
        }
      }
    });
    
    rwSkillMap.forEach((domain, skill) => {
      map.set(skill, { domain, subject: 'english' });
    });
    
    console.log('✅ Domain mappings preloaded:', map.size, 'unique skills');
    console.log('📊 Math skills:', mathSkillMap.size, 'Reading/Writing skills:', rwSkillMap.size);
    
    // Cache for future use
    cacheDomainMappings(map);
    
    return map;
  } catch (error) {
    console.error('Error preloading domain mappings:', error);
    return map;
  }
};

