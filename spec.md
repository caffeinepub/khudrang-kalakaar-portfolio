# Specification

## Summary
**Goal:** Fix the Admin Panel's "Failed to update contacts" error and image upload failures in the Site Media and Projects tabs.

**Planned changes:**
- Audit and fix the backend Motoko actor's update functions for media contacts (WhatsApp number, Instagram URL) and blob assets (logo, cover image, artist portrait, project images) to ensure correct argument types, stable storage persistence, and proper success/error return variants.
- Audit and fix the frontend React Query mutation hooks in `useQueries.ts` for updating contacts and uploading images — ensuring correct argument serialization, File/Blob to Nat8 array conversion, and query invalidation on success.
- Fix the Contacts tab "Save Changes" flow so it correctly calls the backend mutation, shows a success toast on completion, and displays a descriptive error message on failure.
- Fix image upload flows in Site Media and Projects tabs so uploads succeed, the updated images are reflected on the portfolio page, and appropriate success/error notifications are shown.

**User-visible outcome:** Admin Panel users can successfully update WhatsApp number and Instagram URL from the Contacts tab, and upload/replace logo, cover image, artist portrait, and project images without errors. Success and error feedback is shown for all operations.
