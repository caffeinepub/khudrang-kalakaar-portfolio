# Specification

## Summary
**Goal:** Fix admin panel access via logo click, expand admin editing capabilities, and correct the Instagram profile link.

**Planned changes:**
- Make the site logo in the Navigation and Footer components clickable to trigger Internet Identity login and redirect to `/admin` upon successful authentication, with no visual indication of admin access for regular visitors
- Ensure the Admin Panel at `/admin` supports uploading/replacing the site logo, hero cover image, and artist portrait image, as well as adding/editing/deleting gallery artworks and editing artist name, tagline, and bio text — with all changes persisted to the backend
- Fix the Instagram link in the ContactSection (and anywhere else on the site) to open the specific profile URL `https://www.instagram.com/khudrangkalakaar?igsh=bmRsdGx6Z3Nrd2Vy` in a new tab

**User-visible outcome:** The site owner can access the admin panel by clicking the logo, edit all images and key text content from the admin panel, and visitors clicking the Instagram link are taken directly to the correct Instagram profile page.
