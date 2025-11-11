# Deployment Guide for Vercel

This document provides step-by-step instructions to deploy the Zion Car Rentals website on Vercel.

## Prerequisites

- A Vercel account ([sign up](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Access to your backend API at `https://zion-car-rentals.onrender.com`

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select your Git repository
4. Vercel will automatically detect Next.js

### 3. Configure Environment Variables

Add these environment variables in Vercel dashboard:

#### Required Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://zion-car-rentals.onrender.com
```

#### Optional (for payments):

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Configure Build Settings

Vercel should auto-detect these settings from `package.json`:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 5. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `your-project-name.vercel.app`

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes | `https://zion-car-rentals.onrender.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key for payments | No | - |

## Post-Deployment

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### Verify Deployment

- ✅ Frontend loads correctly
- ✅ Cars are displayed
- ✅ Booking form works
- ✅ Admin panel accessible
- ✅ API communication working

## Troubleshooting

### Images Not Loading

If images aren't loading from the backend:
- Verify that `zion-car-rentals.onrender.com` is added to Next.js config
- Check browser console for CORS errors
- Ensure backend `/uploads` route is accessible

### API Connection Issues

- Check that `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Verify backend is running and accessible
- Check CORS configuration on backend

### Build Failures

- Run `npm run build` locally to identify issues
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

## Project Structure

```
zion-car-rentals/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/        # React components
│   ├── lib/              # API clients and utilities
│   └── types/            # TypeScript types
├── public/               # Static assets
├── next.config.mjs       # Next.js configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies
```

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify backend API is accessible

