# Specification

## Summary
**Goal:** Add secure admin registration via a 6-digit code and a Gallery section with full admin management for the Khudrang Kalakaar Portfolio.

**Planned changes:**
- Add a `claimAdminWithCode(code: Text)` backend function that accepts only the hardcoded code "131104", registers the caller as permanent admin if no admin exists yet, and rejects all other attempts
- Replace the existing "Claim Admin Access" button in the AdminPanel with a 6-digit code input form that calls the new backend function and shows success/error feedback
- Add backend gallery functions: `addGalleryImage` (max 15MB per image, admin only), `getGalleryImages` (public), and `deleteGalleryImage` (admin only), with no limit on number of images, all persisting across upgrades
- Add a public Gallery section to the portfolio page with a navigation anchor, responsive grid/masonry layout, lightbox/fullscreen on click, loading skeleton, and empty state
- Add a Gallery tab in the AdminPanel for uploading (with client-side 15MB pre-validation) and deleting artwork images, with a preview grid and per-image delete buttons

**User-visible outcome:** The owner can securely claim admin access using a private 6-digit code, then upload and manage artwork images in a dedicated Gallery tab in the admin panel, while visitors can browse the gallery in a responsive grid with fullscreen lightbox view on the public portfolio page.
