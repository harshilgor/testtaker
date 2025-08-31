# Supabase Configuration

## App env vars (Vite)
Create a `.env` file in the repo root (use `env.example` as a template):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Restart `vite` after adding env vars.

## Edge Function secrets
The function `openai-insight-generator` expects these secrets in the Supabase project:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- Insights (OpenAI API key)

Set them with the CLI:

```
supabase secrets set ^
  SUPABASE_URL=https://<project-ref>.supabase.co ^
  SUPABASE_ANON_KEY=<anon-key> ^
  Insights=<openai-api-key>
```

## Linking this repo
If the Supabase CLI is installed:

```
supabase login
supabase link --project-ref <project-ref>
```

Then you can deploy functions and run migrations:

```
supabase functions deploy openai-insight-generator
supabase db push
```


