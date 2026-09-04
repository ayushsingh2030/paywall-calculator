# Paywall Calculator — The Most Evil Calculator Ever Made

> A fully functional calculator that blocks every result behind increasingly annoying subscription paywalls, fake payment gateways, and a button that runs away from you. Built as a single HTML file (plus CSS + JS) for maximum portability.

---

## What It Does

Every time you try to get a result from the calculator, it stops you with escalating anti-user "monetization":

| Feature | What Happens |
|---|---|
| **1. Paywall Trigger** | After pressing `=`, a sleek paywall popup appears instead of the answer |
| **2. Tiered Subscriptions** | The paywall shows your expression and says it needs a paid tier |
| **3. Fake Payment Gateway** | Clicking "Subscribe" opens a realistic checkout screen (UPI / Card / Wallets) |
| **4. Payment Failure** | Every payment option shows "Payment Failed: Bro is broke" |
| **5. Running Button** | The "Maybe Later" close button **runs away** from your cursor — you must chase it down |
| **6. Sound Effects** | Comical Web Audio API sounds at every step |

---

## Features

### Calculator (Actually Works)
- Full basic math: addition, subtraction, multiplication, division, modulo, negation
- Decimal support, backspace, all-clear
- Chained operations (e.g. `2 + 2 + 2 =`)
- Keyboard support: `0-9`, `.`, `+`, `-`, `*`, `/`, `%`, `Enter`, `Backspace`, `Esc`, `C`

### Tiered Paywall System
Two subscription tiers based on the operation:

| Tier | Price | Covers |
|---|---|---|
| **Basic Mathematics Tier** | $9.99/mo | Addition (+), Subtraction (−), Negation (±) |
| **Advanced STEM Pass** | $24.99/mo | All Basic + Multiplication (×), Division (÷), Modulo (%) |

The paywall shows:
- Your exact expression at the top (e.g. `2 × 2`)
- A custom reason message per tier
- The relevant tier is auto-highlighted as "RECOMMENDED"

### Fake Payment Gateway
A realistic checkout screen with:
- **UPI tab**: GPay / PhonePe / Paytm buttons + UPI ID input field
- **Card tab**: Card number (auto-formatted), expiry, CVV, cardholder name
- **Wallets tab**: Amazon Pay, MobiKwik, FreeCharge
- All payment attempts immediately fail with "**Payment Failed — Bro is broke**"
- "Try Again" button to stay trapped in the gateway

### The Running Button (The Best Part)
When the paywall appears, the "Maybe Later" button:
- **Jumps to a random position** inside the paywall card
- **Runs away from your mouse cursor** using physics-based velocity
- Gets **faster** when you move quickly
- Plays a **wobble animation** on each escape
- Shows witty counter messages: `"Nice try 😏 (4 left)"`, `"Nope! (3 left)"`, etc.
- After **5 near-misses**, you successfully catch it and see your answer
- Shows a `"Catch me if you can 😏"` hint for the first 4 seconds

### Sound Effects (Web Audio API — No External Files)
| Event | Sound |
|---|---|
| Calculator key press | Quick click beep |
| Paywall appears | Ascending triple-tone fanfare |
| Payment gateway opens | Cash register "ka-ching!" |
| Payment fails | Sad trombone (G-G-Bb-E low descending) |
| Button escapes | High-pitched double-beep |
| Mouse gets close | Low warning buzz |
| Button finally caught | Triumphant ascending ding |
| Close paywall | Descending tone |

---

## File Structure

```
paywall-calculator/
├── index.html    — Single-page calculator with embedded modals
├── styles.css    — MIUI-style calculator + all paywall/gateway styles
├── script.js     — Calculator logic + paywall system + sound effects
└── README.md     — You are here
```

---

## How to Run

### Option 1: Open Directly
Just open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari). No server needed.

### Option 2: Local Server
```bash
cd paywall-calculator
python -m http.server 8000
# Then open http://localhost:8000
```

### Option 3: GitHub Pages
The repo is hosted at: **https://ayushsingh2030.github.io/paywall-calculator/**

---

## How to Use

1. Open the calculator
2. Type any math expression (e.g. `2 + 2` or `5 × 3`)
3. Press `=` — watch the paywall appear
4. Read the tier message and see which tier is recommended
5. Click **"SELECT BASIC"** or **"SELECT ADVANCED"** to enter the payment gateway
6. Try any payment method — it will always fail with "Payment Failed: Bro is broke"
7. Click **"Try Again"** to stay trapped, or...
8. Click **"Maybe Later"** — then **chase the button** around the screen
9. Catch it after 5 near-misses to finally see your answer
10. Press `Escape` at any time to quickly close the paywall

---

## Design Philosophy

This project is a **satirical commentary on dark UI patterns** and aggressive monetization:

- **Running buttons** — a parody of manipulative "dark patterns" used by free-to-play games and shady subscription apps
- **Tiered math tiers** — mocking how basic features get paywalled in freemium software
- **Fake payment failure** — making fun of unreliable payment UX
- **Sound effects everywhere** — the auditory equivalent of notification spam
- **MIUI-style calculator** — sleek, minimal design that feels premium while doing something anti-user

Built with vanilla HTML, CSS, and JavaScript — zero dependencies, zero build step.

---

## Technical Notes

- **Sound synthesis**: All audio generated via Web Audio API oscillators and noise buffers — no audio files needed
- **Audio unlock**: Audio context auto-unlocks on first user interaction (browser autoplay policy)
- **Physics**: Button uses velocity + friction model with boundary bouncing
- **No frameworks**: Pure vanilla JS, works offline, no npm/build required
- **Mobile-friendly**: Responsive layout adapts to smaller screens

---

## Author

Built by [Ayush Singh](https://github.com/ayushsingh2030) as a fun project / dark UI parody.

**GitHub**: https://github.com/ayushsingh2030/paywall-calculator  
**Live**: https://ayushsingh2030.github.io/paywall-calculator/
