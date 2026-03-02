# Specification

## Summary
**Goal:** Fix the Admin Panel login stuck state, update the hero tagline, and replace the dynamic QR code with the official Instagram QR code image.

**Planned changes:**
- Fix `AdminLogin.tsx` so the login button does not get stuck in "Initializing..." state; validate hardcoded credentials, open Internet Identity popup cleanly, and reset button state if authentication fails or is cancelled
- Update the tagline in `HeroSection.tsx` to "Transforming Blank Walls into Meaningful Art."
- Replace the dynamically generated QR code in `QRSection.tsx` with a static image of the official @KHUDRANGKALAKAAR Instagram QR code (orange-to-pink gradient dot-style with Instagram logo in centre and bold pink label), served from `frontend/public/assets/generated/instagram-qr-khudrangkalakaar.png`

**User-visible outcome:** Admin can successfully log in through the Admin Panel without the button freezing; the hero section shows the updated tagline; the QR section displays the official Instagram QR code image.
