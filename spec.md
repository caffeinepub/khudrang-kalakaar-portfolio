# Specification

## Summary
**Goal:** Fix the "Unauthorized: Only admins can perform this action" error in the Admin Panel so that logged-in admin users can successfully upload site images and save social links.

**Planned changes:**
- Fix the backend authorization check so it correctly recognizes the session established by the client-side adminAuth utilities when admin mutations are called (logo upload, cover/hero image upload, save social links).
- Ensure unauthenticated or non-admin users still receive the unauthorized error.

**User-visible outcome:** After logging in with valid admin credentials, the admin can upload a logo, upload a cover/hero image, and save WhatsApp/Instagram social links in the Admin Panel without seeing the "Unauthorized: Only admins can perform this action" error banner.
