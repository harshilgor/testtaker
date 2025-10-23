# API Integration Guide

## 🔐 Safe API Integration with GitHub

### 1. Environment Variables Setup

Your project is already configured correctly! Here's how to use APIs safely:

#### Create your `.env` file (this stays local):
```bash
# Copy the example file
cp env.example .env
```

#### Add your API keys to `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
```

### 2. Using API Keys in Your Code

#### In React Components:
```typescript
// Access environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Example API call
const callGeminiAPI = async (prompt: string) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  
  return response.json();
};
```

#### In Service Files:
```typescript
// src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const apiService = {
  async fetchData(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

### 3. What Gets Committed to GitHub

✅ **SAFE TO COMMIT:**
- `env.example` - Template file with empty values
- Your source code using `import.meta.env.VITE_*`
- `.gitignore` - Protects your secrets

❌ **NEVER COMMIT:**
- `.env` - Contains your actual API keys
- `.env.local` - Local overrides
- Any file with actual API keys

### 4. Team Collaboration

When someone clones your repo:

1. They copy `env.example` to `.env`
2. They add their own API keys
3. Your code works with their keys

### 5. Deployment

For production deployment (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names as in your `.env` file
3. Never put real API keys in your code

### 6. Security Best Practices

- ✅ Use environment variables
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different keys for development/production
- ✅ Rotate API keys regularly
- ❌ Never hardcode API keys in source code
- ❌ Never commit `.env` files

## Example: Adding a New API

1. Add to `env.example`:
```env
VITE_NEW_API_KEY=
```

2. Add to your `.env`:
```env
VITE_NEW_API_KEY=your_actual_key_here
```

3. Use in code:
```typescript
const newApiKey = import.meta.env.VITE_NEW_API_KEY;
```

4. Commit everything except `.env` - your secrets stay safe!
