/**
 * Branding Configuration for SIH26091 Advisory Portal
 * 
 * You can customize the portal's logo, branding title, and links here.
 * To change the logo image manually, either replace 'frontend/public/assets/logo.svg' 
 * or change 'logoUrl' below to any file path in 'public/' or an external URL.
 */
export const BRANDING = {
  // Path to the primary logo image (relative to public/)
  logoUrl: "/assets/logo.png",
  
  // Optional secondary badge or emblem (e.g. National Emblem / MSME emblem)
  emblemUrl: "/assets/logo.png",

  // Portal text branding
  portalName: "SIH26091 ADVISORY",
  portalFullName: "AI-Powered Hyper-Local Business Advisory & Financial Structuring Platform",
  tagline: "Empowering Rural Micro-Entrepreneurs under Smart India Hackathon 2026",
  
  // Banking & Institutional theme tags
  primaryInstitution: "State Bank of India / MSME Partner Portal",
  sponsorTag: "Smart India Hackathon 2026",
  problemId: "SIH26091",

  // Support & Helpline numbers
  helpline: "1800-11-2211 (Toll-Free) / 1800-425-3800",
  email: "support.sih26091@advisory.gov.in",

  // Navigation Links
  utilityLinks: [
    { label: "Skip to Main Content", href: "#main-content" },
    { label: "About Us", href: "#about" },
    { label: "Schemes Directory", href: "#schemes" },
    { label: "JanSamarth Portal", href: "https://www.jansamarth.in", external: true },
    { label: "Grahak Setu / Support", href: "#support" },
    { label: "Feedback", href: "#feedback" }
  ]
};
