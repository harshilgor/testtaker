// Simple test to check if environment variables are loading
export const testEnvironmentVariables = () => {
  console.log('🔍 Environment Variables Test:');
  console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Found' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
  
  // Show first 10 characters of API key for verification
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    console.log('API Key Preview:', import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10) + '...');
  }
  
  return {
    geminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  };
};


