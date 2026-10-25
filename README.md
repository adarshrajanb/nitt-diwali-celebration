# 🪔 NITT Cultural Council - Diwali Dhamaka Spin & Win Website 🎬

A publicity stunt website created for the **Diwali Celebrations conducted by the Cultural Council, NIT Trichy (NITT)**.

Features a lottery / lucky draw wheel with realistic mechanical physics, flapper needle deflection, Web Audio sound synthesis, Diwali firecrackers & confetti bursts, and personalized downloadable movie passes.

---

## 🎯 The Secret Rigging Mechanism
As requested for the publicity campaign:
- **Every single spin is guaranteed to land on `Ticket for Movie`!**
- **Organic Physics:** It uses dynamic easing with random angular jitter ($\pm 10^\circ$) within the target sector, variable initial revolutions (7 to 9 full turns), and natural flapper tick deceleration so it looks completely authentic and believable to any student spinning the wheel.
- **Cheeky Repeat Spins:** If a student clicks "Spin Again", it spins with high drama and lands on `Ticket for Movie` once again!

---

## 🎁 Prizes Displayed on the Wheel
1. **🎟️ Ticket for Movie** *(Always Lands Here - Barn Hall Diwali Screening)*
2. **🍿 Free Popcorn** *(Large Butter Tub)*
3. **🏛️ Bay 0 Access** *(VIP Lounge Pass)*
4. **🏷️ ₹200 Stall Coupon** *(Food & Game Stalls)*
5. **🪔 Diwali Sweets Box** *(Laddu & Kaju Katli)*
6. **🎆 Sparklers Pack** *(Diwali Special Kit)*
7. **👕 Fest Exclusive T-Shirt** *(Cultural Council Drop)*
8. **🥤 Chilled Mocktail** *(Food Court Perk)*

---

## 🚀 How to Run & Open

### Option 1: Double Click (Zero Setup)
Simply open [`standalone.html`](file:///C:/Users/adars/.gemini/antigravity/scratch/nitt-diwali-wheel/standalone.html) or [`index.html`](file:///C:/Users/adars/.gemini/antigravity/scratch/nitt-diwali-wheel/index.html) directly in any web browser (Chrome, Edge, Safari, Firefox) on laptop or mobile.

### Option 2: Local HTTP Server (For Testing on Mobile / Campus Wi-Fi)
Open PowerShell in this folder and run:
```powershell
python -m http.server 8080
```
Then open `http://localhost:8080` (or `http://<your-ip>:8080` from your phone on the same Wi-Fi).

---

## 🌟 Key Features
- **Zero External Dependencies:** Built with vanilla HTML5, Canvas 2D, and native Web Audio API oscillators. No external audio files or npm dependencies that could fail to load or get blocked by CORS.
- **Diwali Visuals:** Midnight royal purple theme, flickering brass diya lamps with animated SVG flames, marigold toran garland, and twinkling 24-bulb LED marquee rim.
- **Realistic Audio:** Synthesized mechanical ticks that slow down in lockstep with the wheel's angular speed, spin launch whoosh, victory fanfare chords, and firecracker crackle bursts.
- **Downloadable Admit Pass:** Canvas-rendered cinema ticket with unique code (`NITT-DW26-XXXXX`), venue (`Barn Hall`), student name, roll number, and mock barcode that students can save directly as a PNG to their phone!
- **Viral Sharing:** "Share on WhatsApp" button with pre-written message to invite hostel mates.
- **Organizer Secret Mode:** Press `Ctrl + Shift + D` (or click `🔒 CC Organizer Access` in the footer) to open the secret CC control modal where organizers can change or inspect the landing target.
