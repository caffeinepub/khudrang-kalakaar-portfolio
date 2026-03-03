# Khudrang Kalakaar Portfolio

## Current State

A wall painting artist portfolio website for Mudit Sharma (Khudrang Kalakaar). The site has:
- A full portfolio with hero, about, projects, gallery, services, and contact sections
- An Admin Panel accessible by triple-tapping the logo, with tabs for: Projects, Site Media, Contacts, Gallery, Edit Text
- Backend in Motoko with stable storage for artworks, gallery images, logo, cover image, artist portrait, media contacts
- Admin authentication via a 6-digit code (131104) that sets `adminPrincipal` in the backend
- **BUG**: All protected backend functions check `AccessControl.hasPermission(accessControlState, caller, #admin)` but `AccessControl.getUserRole` calls `Runtime.trap("User is not registered")` for any caller not in the userRoles map (which is everyone after a fresh deploy or canister restart). The `AccessControl.assignRole` inside `claimAdminWithCode` also traps because the caller is not yet an admin. So even after claiming admin, every upload/save call fails with "Unauthorized".

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- **Backend**: Replace ALL `AccessControl.hasPermission(accessControlState, caller, #admin)` checks in every protected function with `isAdminCaller(caller)` — which checks `adminPrincipal == ?caller`. This is the only auth system that works reliably because `adminPrincipal` is stable and set directly by `claimAdminWithCode`.
- **Backend**: Remove the `AccessControl.assignRole` call from `claimAdminWithCode` since it traps.
- **Backend**: The `isAdminCaller` helper already exists and is correct — it just needs to be used consistently.

### Remove
- The broken `AccessControl.assignRole(accessControlState, caller, caller, #admin)` call from `claimAdminWithCode`

## Implementation Plan

1. Regenerate backend Motoko so all protected functions use `isAdminCaller(caller)` instead of `AccessControl.hasPermission(...)`.
2. Keep all existing data types, stable variables, and function signatures identical — only change the auth check inside each guarded function.
3. No frontend changes needed.
