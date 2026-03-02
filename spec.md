# Specification

## Summary
**Goal:** Fix admin authentication/permission errors and font color contrast issues across the Khudrang Kalakaar Portfolio.

**Planned changes:**
- Fix backend admin principal registration and permission check so authenticated admins are correctly recognized and can perform all admin-only actions without receiving "Unauthorized" errors.
- Fix frontend admin actor usage so all mutation hooks in the Admin Panel use the authenticated actor (not anonymous) after login.
- Fix font color contrast across the entire public-facing portfolio (Hero, About, Services, Gallery, Contact, Footer, Navigation, Why Choose, QR sections) and the Admin Panel, ensuring all text is clearly legible while preserving the warm cream/terracotta/gold design palette.

**User-visible outcome:** Logged-in admins can save social media links, edit content, manage artworks, and perform all admin actions without errors. All text across the portfolio and Admin Panel is clearly readable against its background.
