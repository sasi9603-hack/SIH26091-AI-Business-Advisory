# Manual Logo and Image Customization Guide

You can easily replace the logos and images in this application at any time!

## 🖼️ How to Change the Logo

You have two easy ways to update the logo:

### Method 1: Drop your image into this folder (Recommended)
1. Copy your logo file (PNG or SVG) into this directory (`frontend/public/assets/`).
2. Name it `logo.png` or `logo.svg` (replacing the default placeholder).
3. Refresh your browser! The logo will automatically update across the entire portal.

### Method 2: Configure in `branding.ts`
1. Open [`src/config/branding.ts`](../../src/config/branding.ts).
2. Change the `logoUrl` property to your new image filename or an external URL:
   ```typescript
   export const BRANDING = {
     logoUrl: "/assets/my-custom-logo.png", // <--- change this line
     portalName: "State Bank of India / SIH26091",
     ...
   };
   ```

## 📸 Image Assets in this Directory
* `logo.svg` - Main portal header logo (vector format)
* `logo.png` - Raster fallback logo
* `pmmy_icon.svg` - Micro-credit and scheme emblem
* `banner.jpg` - (Optional) Hero background image
