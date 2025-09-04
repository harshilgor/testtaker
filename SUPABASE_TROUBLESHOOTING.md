# 🔧 Supabase Edge Functions Troubleshooting Guide

## 🚨 Current Issue: "Edge Functions being unhealthy"

Your Supabase project `kpcprhkubqhslazlhgad.supabase.co` cannot be reached, which means either:
- The project is paused due to inactivity
- The project has been deleted
- There are DNS/network issues

## 🛠️ Step-by-Step Fix

### 1. **Check Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Look for your project `kpcprhkubqhslazlhgad`

### 2. **If Project is Paused (Most Likely)**
- Click on the paused project
- Click "Resume" button
- Wait 2-3 minutes for services to restart
- Your Edge Functions will become healthy again

### 3. **If Project is Deleted/Missing**
Create a new project:
1. Click "New Project"
2. Choose your organization
3. Set up database
4. Get new credentials

### 4. **Update Your Environment Variables**
Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your_new_project_id.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here
```

### 5. **Restart Your Development Server**
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## 🔍 Alternative Solutions

### **Option A: Use Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Check project status
supabase status

# Start local development
supabase start
```

### **Option B: Check Network/Firewall**
- Ensure your network allows HTTPS connections
- Check if corporate firewall is blocking Supabase
- Try using a different network (mobile hotspot)

### **Option C: Verify Project Health**
In Supabase Dashboard:
- Go to Settings > General
- Check "Project Status"
- Look for any error messages
- Check Edge Functions logs

## 📱 Quick Test

After fixing, test your connection:
1. Open browser console (F12)
2. Look for Supabase connection logs
3. Try logging in again
4. Check if error message disappears

## 🆘 Still Having Issues?

If the problem persists:
1. Check Supabase status page: [https://status.supabase.com](https://status.supabase.com)
2. Contact Supabase support
3. Check your project's Edge Functions logs
4. Verify your billing plan hasn't expired

## 🔑 Important Notes

- **Never commit `.env` files** to version control
- **Keep your Supabase keys secure**
- **Monitor your project usage** to avoid pausing
- **Edge Functions may take time** to become healthy after resuming

## 📞 Need Help?

- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- GitHub Issues: [https://github.com/supabase/supabase/issues](https://github.com/supabase/supabase/issues)
