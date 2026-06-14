1. Overview
This feature adds customizable health guidelines so the app can automatically interpret a user’s blood pressure numbers and provide clear, simple recommendations.
Users set their own thresholds in Settings. When they log a new reading, the app instantly calculates the blood pressure stage, shows the correct status message (e.g. “High blood pressure - stage 1”), and displays a personalised recommendation (e.g. “Stage 1 hypertension. See your doctor” or “Continue normal activity”).
Key rules:

Thresholds only affect new readings (future logs).
Existing saved readings keep their original text (“High blood pressure - stage 1”).
The app uses official 2025 AHA/ACC guidelines as the default (standard across the industry), but lets users change them if needed.


2. User Stories

As an elderly user, I want to set my own blood pressure thresholds so I know what my numbers really mean.
As a user, I want the app to automatically tell me if my latest reading is normal, elevated, stage 1, stage 2, or crisis.
As a user, I want clear, short recommendations so I immediately know what to do (or when to see a doctor).
As a user, I want the recommendation to be personalised (e.g. “8 mmHg above my target of 130/80”).
As a caregiver or user, I want thresholds to stay customisable without changing old saved entries.


3. Requirements
Functional Requirements

Settings screen — Add a new section called “Health Guidelines”.
Log New Reading — When saving a reading, automatically calculate stage + show status + recommendation.
History screen — Update every reading card to show the dynamic status + recommendation (exactly like your current screenshot, but now with automatic content).
Home screen — Add a small summary card below the big blue preview showing the latest reading + recommendation.
Persistence — Thresholds saved in local storage (Expo Storage or your existing useStore.ts / storage.ts).
Performance — Everything runs instantly; no heavy calculations.

Non-Functional Requirements

All text must be large, clear, and simple (big fonts, plenty of white space, easy to read on small phones).
Recommendations must be short (1–2 lines max) and use positive, encouraging language.
Full support for dark mode and high contrast.
Works on both iOS and Android.


4. UI Changes
4.1 New Settings Screen – “Health Guidelines”
Add this section below the existing Appearance section:
textHealth Guidelines
┌──────────────────────────────────────┐
│ Blood Pressure Guidelines             │
│                                      │
│  Normal       : Systolic < 120        │
│  Elevated     : 120–129 / 80–89       │
│  Stage 1      : 130–139 / 90–99      │
│  Stage 2      : 140–179 / 100–119    │
│  Crisis       : 180+ / 120+          │
│                                      │
│ Pulse Guidelines                      │
│  Low          : < 60 bpm             │
│  Normal       : 60–100 bpm           │
│  High         : > 100 bpm            │
│                                      │
│ My Target (optional)                 │
│ Systolic      : [120]                │
│ Diastolic     : [80]                 │
│                                      │
│ [Save Changes]  •  [Reset to Standard]│
└──────────────────────────────────────┘

Make all numbers large and bold.
Use text fields for easy editing.
Include a “Reset to Standard Guidelines” button (loads 2025 AHA/ACC defaults).

4.2 History Screen – Updated Reading Cards
Replace the current static status with dynamic content from the thresholds:
text125/85
High blood pressure - stage 1
Stage 1 hypertension. See your doctor if it continues.
PULSE    75 bpm
10 June 2026 at 6:17 pm
Each card will now show:

The blood pressure number
The automatic status (red text)
The recommendation text
Pulse + date

4.3 Home Screen – Latest Reading Summary
Add a small card just below the big blue preview:
textYour latest reading
125/85
High blood pressure - stage 1
Stage 1 hypertension. See your doctor if it continues.

5. Threshold Logic (2025 AHA/ACC Guidelines)
Default thresholds (2025 guidelines):



































CategorySystolic (mmHg)Diastolic (mmHg)Normal< 120< 80Elevated120–129< 80Stage 1 Hypertension130–13980–89Stage 2 Hypertension140–17990–119Crisis180+120+
Pulse categories (default):

Low: < 60 bpm
Normal: 60–100 bpm
High: > 100 bpm

My Target (optional):
User can set their own goal (default = 130/80 mmHg).
Recommendation examples (simple and encouraging):

Normal → “Keep up the great work! Your numbers are in the healthy range.”
Stage 1, within target → “Stage 1 hypertension. Continue normal activity but monitor closely.”
Stage 2 → “Stage 2. See your doctor within 2 weeks.”
Crisis → “This is a medical emergency! Go to the emergency room immediately.”


6. Technical Implementation (no code, just structure)
Where to add:

Settings.tsx — Add the new “Health Guidelines” section.
bpLogs.ts (in db) — Update the reading creation logic to call the threshold function.
useBPLogs.ts (hook) — Add the calculation when saving a new log.
History.tsx — Update the reading card component (Card.tsx or inline in history) to show status + recommendation.
Index.tsx (Home) — Add the latest-reading summary card.
utils/bpCalculations.ts — Add the main function (getReadingStatus(systolic, diastolic)) that returns the status text + recommendation text.
types/index.ts — Add BloodPressureStage and ReadingStatus types if needed.

Data flow:

User edits thresholds in Settings.
Thresholds saved locally.
On new log, thresholds are read and used to calculate stage + recommendation.
Old readings stay unchanged.


7. Bonus (optional but recommended)

Scoring system — Give points when the user stays within their target (e.g. “+5 points for being 5 mmHg under target”).
Export feature — Include the status + recommendation in the photo snapshot (double-tap to export).
Dietician notes — Later addition: allow a short comment field per reading.


8. Next Steps

Add the “Health Guidelines” section to Settings.
Implement the threshold calculation function.
Update History screen to show automatic status + recommendation.
Add latest-reading summary on Home screen.
Add “Save Changes” button and persistence.