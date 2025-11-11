# Vercel Deployment Steps for Zion Car Rentals

## ✅ Pre-Deployment Checklist

### Files Ready for Deployment:
- ✅ `package.json` - Updated and ready
- ✅ `next.config.mjs` - Configured with image domains
- ✅ `.gitignore` - Updated to exclude build files
- ✅ `.vercelignore` - Excludes unnecessary files
- ✅ `DEPLOYMENT.md` - Full deployment guide
- ✅ Environment variables configured in code

---

## 🚀 Deployment Instructions

### Step 1: Commit and Push Your Changes

```bash
git add .
git commit -m "Prepare for Vercel deployment - Updated pricing, admin modals, and fixes"
git push origin main
```

### Step 2: Create Vercel Account & Import Project

1. **Sign up/Login:** Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_API_BASE_URL = https://zion-car-rentals-backend.up.railway.app
```

Optional (for Razorpay payments):
```
NEXT_PUBLIC_RAZORPAY_KEY_ID = your_razorpay_key
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at `your-project-name.vercel.app`

---

## 🔧 Configuration Summary

### Build Settings (Auto-detected by Vercel):
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Image Domains Configured:
- `images.unsplash.com` (placeholder images)
- `zion-car-rentals-backend.up.railway.app` (backend images)
- `localhost` (development)

### Backend Integration:
- API Base URL: `https://zion-car-rentals-backend.up.railway.app`
- CORS enabled on backend
- File uploads handled via `/uploads` route

---

## 📋 What Was Updated for Vercel Deployment

### 1. **Modified Files:**
   - `package.json` - Fixed structure and added proper scripts
   - `next.config.mjs` - Added backend image domain
   - `.gitignore` - Updated to exclude build artifacts
   - `README.md` - Added deployment instructions
   - Created `DEPLOYMENT.md` - Comprehensive guide
   - Created `.vercelignore` - Deployment exclusions

### 2. **Updated Backend Integration:**
   - Modified car pricing to use new backend structure
   - Updated booking form to include `withDriver` option
   - Fixed image URLs to work with backend
   - Updated document viewer to use full API URLs

### 3. **Component Updates:**
   - Admin modals: Floating style with black background
   - Booking modals: Accept/Decline functionality
   - Car cards: New pricing structure
   - Booking form: Driver selection included

---

## 🌐 Post-Deployment

### Test Your Deployment:

1. **Homepage:** `https://your-project.vercel.app`
2. **Cars Page:** `https://your-project.vercel.app/cars`
3. **Admin:** `https://your-project.vercel.app/admin/dashboard`
4. **Login:** Use `admin@example.com` credentials

### Common Issues & Solutions:

#### Issue: Images not loading
**Solution:** 
- Verify backend is running and accessible
- Check CORS settings on backend
- Ensure image URLs in database are full paths

#### Issue: API calls failing
**Solution:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is set in Vercel
- Check backend API is online
- Review browser console for errors

#### Issue: Build fails
**Solution:**
- Check Vercel build logs
- Ensure all dependencies in `package.json`
- Verify TypeScript has no errors

---

## 🎯 Quick Deploy Summary

```bash
# 1. Commit changes
git add .
git commit -m "Ready for Vercel deployment"
git push

# 2. Go to Vercel and import project

# 3. Add environment variable:
# NEXT_PUBLIC_API_BASE_URL = https://zion-car-rentals-backend.up.railway.app

# 4. Click Deploy

# 5. Done! 🎉
```

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify backend API is accessible
4. Ensure all environment variables are set

Your project is now ready to deploy to Vercel! 🚀

