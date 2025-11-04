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
    // Load Math domains
    const { data: mathData } = await supabase
      .from('question_bank')
      .select('skill, domain')
      .eq('assessment', 'SAT')
      .eq('test', 'Math')
      .not('skill', 'is', null)
      .not('domain', 'is', null);
    
    if (mathData) {
      mathData.forEach(row => {
        if (row.skill && row.domain) {
          map.set(row.skill, { domain: row.domain, subject: 'math' });
        }
      });
    }
    
    // Load Reading and Writing domains
    const { data: rwData } = await supabase
      .from('question_bank')
      .select('skill, domain')
      .eq('assessment', 'SAT')
      .eq('test', 'Reading and Writing')
      .not('skill', 'is', null)
      .not('domain', 'is', null);
    
    if (rwData) {
      rwData.forEach(row => {
        if (row.skill && row.domain) {
          map.set(row.skill, { domain: row.domain, subject: 'english' });
        }
      });
    }
    
    console.log('✅ Domain mappings preloaded:', map.size, 'entries');
    
    // Cache for future use
    cacheDomainMappings(map);
    
    return map;
  } catch (error) {
    console.error('Error preloading domain mappings:', error);
    return map;
  }
};

