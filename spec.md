# Specification

## Summary
**Goal:** Fix the admin authentication system so that username and password credentials alone are sufficient to access and operate the admin panel.

**Planned changes:**
- Fix the backend `loginAdmin` function to grant admin access based solely on a valid username/password pair, removing any Internet Identity or principal-based requirement
- Ensure all admin-gated backend functions (artwork upload, image upload, content edits, social/media contact saves) accept calls authorized via username/password login
- Update the frontend admin authentication flow so the session token from a successful login is passed along with every subsequent admin backend call
- Ensure failed or missing sessions redirect the user back to the login page

**User-visible outcome:** After entering the correct username and password on the AdminLogin page, the admin is redirected to the AdminPanel and can upload artwork, edit content, and save contacts without encountering any "Unauthorized" errors.
