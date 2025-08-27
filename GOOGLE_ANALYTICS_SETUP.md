# Google Analytics & Google Tag Manager Setup

This project has been configured with Google Analytics 4 (GA4) and Google Tag Manager (GTM) at the application level.

## Setup Instructions

### 1. Create Environment Variables

Create a `.env.local` file in your project root and add the following variables:

```bash
# Google Analytics Configuration
# Replace with your actual Google Analytics 4 Measurement ID (starts with G-)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Google Tag Manager Configuration
# Replace with your actual GTM Container ID (starts with GTM-)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 2. Get Your Tracking IDs

#### Google Analytics 4 (GA4)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use existing one
3. Go to Admin → Data Streams → Web
4. Copy your Measurement ID (starts with G-)

#### Google Tag Manager
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new account or use existing one
3. Create a new container for your website
4. Copy your Container ID (starts with GTM-)

### 3. Update Configuration

Replace the placeholder values in your `.env.local` file:

```bash
NEXT_PUBLIC_GA_TRACKING_ID=G-ABC123DEF4
NEXT_PUBLIC_GTM_ID=GTM-ABC123D
```

### 4. Restart Development Server

After updating the environment variables, restart your development server:

```bash
npm run dev
```

## Features Implemented

### Google Analytics 4 (GA4)
- ✅ Automatic page view tracking
- ✅ Route change detection (Next.js App Router)
- ✅ Page title and URL tracking
- ✅ Custom event support

### Google Tag Manager
- ✅ GTM script loading
- ✅ Data layer initialization
- ✅ NoScript fallback for users with JavaScript disabled
- ✅ Custom event and data layer support

## Usage

The analytics are automatically loaded on every page. You can also track custom events:

```typescript
// Track custom events
window.gtag('event', 'purchase', {
  transaction_id: 'T_12345',
  value: 99.99,
  currency: 'USD'
});

// Push to data layer for GTM
window.dataLayer.push({
  event: 'custom_event',
  custom_parameter: 'value'
});
```

## Components Created

- `GoogleAnalytics.tsx` - GA4 tracking component
- `GoogleTagManager.tsx` - GTM tracking component
- `Analytics.tsx` - Combined analytics component

## Files Modified

- `app/layout.tsx` - Added Analytics component
- `app/lib/config.ts` - Added GA and GTM configuration
- `app/components/common/GoogleAnalytics.tsx` - Created analytics components

## Testing

1. Open your website
2. Open browser DevTools → Network tab
3. Look for requests to:
   - `googletagmanager.com` (GTM)
   - `google-analytics.com` (GA4)
4. Check browser console for any analytics errors

## Production Deployment

Make sure to:
1. Set the correct environment variables in your production environment
2. Test tracking in production
3. Verify data is being received in Google Analytics and GTM
4. Set up any additional tracking requirements in GTM

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure tracking IDs are valid
4. Check if ad blockers are interfering with tracking
