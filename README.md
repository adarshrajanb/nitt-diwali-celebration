# 🪔 NITT Cultural Council - Diwali Celebration Spin & Win 🎬

Official publicity stunt and lucky lottery wheel website created for the **Diwali Celebration organized by the Cultural Council, National Institute of Technology, Tiruchirappalli (NITT)**.

Live GitHub Pages URL: **https://adarshrajanb.github.io/nitt-diwali-celebration/**

---

## 🎯 Public Experience (`index.html`)
- **1-Spin Policy:** Each student can only spin the wheel once. After spinning, their reward is locked into local storage, preventing re-spins while still allowing them to revisit the homepage and access the registration link.
- **Organic Physics:** Dynamic quintic ease-out deceleration curve with random angular jitter ($\pm 10^\circ$), variable initial revolutions (7 to 9 full turns), and natural flapper tick sound feedback.
- **Guaranteed Publicity Winner:** By default, every student lands on **Ticket for Movie** (or whichever prize the Cultural Council organizers configure).
- **Automatic Google Forms Redirect:** Once the wheel lands, a celebration modal pops up with a 4-second auto-redirect countdown (and manual button) straight to the official Google Forms registration.
- **Zero Public Admin Clutter:** No organizer buttons or modals exist on the public landing page.

---

## 🔒 Organizer Admin Portal (`admin.html`)
The website includes a dedicated password-protected administrative subpage for Cultural Council organizers:
- **URL:** `admin.html` (e.g. `https://adarshrajanb.github.io/nitt-diwali-celebration/admin.html`)
- **Secret Shortcut from Main Page:** Press `Ctrl + Shift + D` anytime on the homepage to navigate directly to the admin page.
- **Default Passcode:** `nittcultural` (can be changed inside the admin dashboard).

### Key Admin Features:
1. **🎯 Change What Students Should Win:**
   - Select which of the 8 wheel sectors is the guaranteed rigged winner (e.g., *Ticket for Movie*, *Free Popcorn*, *Bay 0 Access*, etc.).
   - Option to toggle `🎲 Fair Random Spin` if organizers ever want unbiased random outcomes.
2. **🔗 Change Google Forms Link:**
   - Update the destination Google Forms URL where students register and pay.
   - Configure the auto-redirect countdown duration (4s, 6s, 8s, or manual click only).
   - "Test URL" button to verify the link.
3. **🎡 Customize Wheel Tiles (All 8 Slices):**
   - Edit full reward titles, Line 1 & Line 2 wheel text (in bold high-contrast font), icons/emojis, and color themes (Royal Crimson, Navy, Emerald, Royal Purple, Saffron Amber, Magenta, Teal, Rust Amber).
4. **👁️ Real-Time Live Preview & Test Spin:**
   - Embedded canvas simulator allows organizers to spin and test the wheel before students use it.
5. **🛠️ Council Testing Tools:**
   - "Reset My Device Spin Lock": Clears the 1-spin restriction on your browser for instant testing.
   - "Export Config JSON": One-click backup of all customized settings.
   - "Change Admin Passcode": Update the security password.
