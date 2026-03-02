# Specification

## Summary
**Goal:** Fix and improve social links, admin panel trigger behavior, admin login/upload logic, and add a QR code section for the Khudrang Kalakaar portfolio app.

**Planned changes:**
- Update the Instagram icon/button link to open `https://www.instagram.com/khudrangkalakaar` in a new tab with `rel="noopener noreferrer"` everywhere it appears in the UI.
- Update the WhatsApp icon link to open `https://wa.me/917665854193?text=Hello%20Mudit%20Sharma` in a new tab.
- Change the admin panel trigger to require a double-click (two taps within 500ms) on the logo; reset the tap counter after 500ms of inactivity.
- Admin login validates username `Deepak Kumawat` and password `Kinnu*0613`; on success shows the upload section, on failure shows an "Invalid Credentials" error message.
- Admin image upload reads a selected local file as a data URL and immediately appends it to the gallery without a page reload; does nothing if no file is selected.
- Add a QR code section on the main page with the heading "Scan QR to Visit Instagram" displaying the QR image from `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.instagram.com/khudrangkalakaar`.

**User-visible outcome:** Instagram and WhatsApp social links open the correct URLs in new tabs. Double-clicking the logo reveals the hidden admin panel where the owner can log in and upload images to the gallery instantly. A QR code section is visible on the main page for visitors to scan and visit the Instagram profile.
