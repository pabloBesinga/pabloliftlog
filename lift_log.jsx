// Lift Log — v8.1 PPLUL (30 Sep 2026). Claude-artifact version of index.html.
// Same plan data and logic as the PWA; storage uses window.storage (artifact) instead of the localStorage shim.
import { useState, useEffect, useCallback, useRef } from "react";

// ---- Minimal icon set ----
const Ic = ({ children, size = 14, color }) => (
  <span style={{ fontSize: size, lineHeight: 1, color, display: "inline-block" }}>{children}</span>
);
const Plus = ({ size, color }) => <Ic size={size} color={color}>＋</Ic>;
const Trash2 = ({ size, color }) => <Ic size={size} color={color}>🗑</Ic>;
const ChevronDown = ({ size, color }) => <Ic size={size} color={color}>⌄</Ic>;
const ChevronUp = ({ size, color }) => <Ic size={size} color={color}>⌃</Ic>;
const History = ({ size, color }) => <Ic size={size} color={color}>🕘</Ic>;
const Dumbbell = ({ size, color }) => <Ic size={size} color={color}>🏋</Ic>;
const Check = ({ size, color }) => <Ic size={size} color={color}>✓</Ic>;
const X = ({ size, color }) => <Ic size={size} color={color}>✕</Ic>;
const Calendar = ({ size, color }) => <Ic size={size} color={color}>📅</Ic>;
const Archive = ({ size, color }) => <Ic size={size} color={color}>🗄</Ic>;
const Utensils = ({ size, color }) => <Ic size={size} color={color}>🍽</Ic>;
const Scale = ({ size, color }) => <Ic size={size} color={color}>⚖</Ic>;
const Flag = ({ size, color }) => <Ic size={size} color={color}>🏁</Ic>;

// ---- Palette ----
const C = {
  bg: "#12151A",
  card: "#1B1F26",
  cardBorder: "#2A2F38",
  amber: "#C98A3C",
  amberSoft: "#4A3A24",
  green: "#5CA37A",
  greenSoft: "#1D3A2B",
  blue: "#5B8FC9",
  blueSoft: "#1E2C3E",
  text: "#EDEAE3",
  muted: "#8B93A1",
  danger: "#C9603C",
  dangerSoft: "#2A1D18",
};

// ============================ PLAN DATA (v8 PPLUL — 30 Sep 2026 · scan data 29 Sep) ============================

const RUN_DAY_INDEXES = []; // v8: no scheduled runs (race off) — use the Run day toggle manually if you do a long run
const LEGACY_DAY_NAMES = { UpperA: "Upper A", LowerA: "Lower A", UpperB: "Upper B", LowerB: "Lower B" }; // pre-v8 sessions

const NUTRITION = {
  runTarget:  { kcal: 2570, protein: 208, carbs: 288, fat: 63 },
  liftTarget: { kcal: 2300, protein: 204, carbs: 232, fat: 63 },
  meals: [
    {
      name: "Meal 1 — Pre/Post Workout",
      time: "9:30–11:00 AM",
      note: "Biggest carb meal of the day. Fuels the session and the recovery from it.",
      foods: [
        { name: "Whey Protein (ON)", amount: "30g / 1 scoop", kcal: 120, protein: 24, carbs: 3, fat: 1 },
        { name: "Rolled Oats", amount: "90g", kcal: 338, protein: 12, carbs: 59, fat: 6 },
        { name: "Banana", amount: "1 medium", kcal: 105, protein: 1, carbs: 27, fat: 0 },
      ],
    },
    {
      name: "Meal 2 — Chicken + Rice",
      time: "1:00–2:00 PM",
      note: "Built around your packed 130g serving. Rice is the biggest carb hit of the day, right after your session.",
      foods: [
        { name: "Chicken Breast", amount: "130g (1 packed serving)", kcal: 215, protein: 41, carbs: 0, fat: 4 },
        { name: "Cooked White Rice", amount: "200g", kcal: 260, protein: 5, carbs: 56, fat: 0,
          lift: { amount: "120g", kcal: 156, protein: 3, carbs: 34, fat: 0 } },
        { name: "Broccoli", amount: "100g", kcal: 35, protein: 3, carbs: 7, fat: 0 },
        { name: "Boiled Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
      ],
    },
    {
      name: "Meal 3 — Afternoon Snack",
      time: "4:30–5:00 PM",
      note: "Rice cakes removed — swapped for cooked white rice at the same calories. Almonds stay for the fat target.",
      foods: [
        { name: "Whole Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Cooked White Rice", amount: "160g", kcal: 208, protein: 4, carbs: 45, fat: 0,
          lift: { amount: "100g", kcal: 130, protein: 3, carbs: 28, fat: 0 } },
        { name: "Almonds", amount: "15g", kcal: 87, protein: 3, carbs: 3, fat: 8 },
      ],
    },
    {
      name: "Meal 4 — Eggs + Light Carb",
      time: "7:00–7:30 PM",
      note: "Smallest meal, and where the calories from the 130g chicken servings were put back — oats raised 40g to 60g.",
      foods: [
        { name: "Whole Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Egg Whites", amount: "4 pcs", kcal: 68, protein: 16, carbs: 0, fat: 0 },
        { name: "Rolled Oats", amount: "60g", kcal: 225, protein: 8, carbs: 39, fat: 5 },
      ],
    },
    {
      name: "Meal 5 — Chicken + Veg + Rice",
      time: "10:30–11:00 PM",
      note: "Late meal for your long day. Second packed serving. Nighttime carbs don't make you fat — total calories do.",
      foods: [
        { name: "Chicken Breast", amount: "130g (1 packed serving)", kcal: 215, protein: 41, carbs: 0, fat: 4 },
        { name: "Broccoli", amount: "150g", kcal: 53, protein: 5, carbs: 11, fat: 0 },
        { name: "Cooked White Rice", amount: "120g", kcal: 156, protein: 3, carbs: 34, fat: 0,
          lift: { amount: "60g", kcal: 78, protein: 2, carbs: 17, fat: 0 } },
        { name: "Boiled Egg", amount: "1 pc", kcal: 70, protein: 6, carbs: 1, fat: 5 },
      ],
    },
  ],
};

const CARB_SWAPS = [
  { name: "Cooked white rice (default)", amount: "160g", kcal: 208, carbs: 45 },
  { name: "Sweet potato / kamote, boiled", amount: "240g", kcal: 206, carbs: 48 },
  { name: "Potato, boiled", amount: "250g", kcal: 218, carbs: 50 },
  { name: "Rolled oats, dry", amount: "55g", kcal: 207, carbs: 36 },
  { name: "Banana (lakatan or saba)", amount: "2 medium", kcal: 210, carbs: 54 },
  { name: "Pandesal", amount: "3 pcs", kcal: 228, carbs: 42 },
  { name: "Cooked pasta", amount: "145g", kcal: 230, carbs: 45 },
];

const SCAN = {
  date: "29 Sep 2026",
  prevDate: "20 Aug 2026",
  rows: [
    { label: "Weight", unit: "kg", prev: 87.4, now: 86.9, goodDown: true },
    { label: "Body fat", unit: "%", prev: 16.7, now: 15.0, goodDown: true },
    { label: "Fat mass", unit: "kg", prev: 14.6, now: 13.0, goodDown: true },
    { label: "Lean body mass", unit: "kg", prev: 72.8, now: 73.9, goodUp: true },
    { label: "Skeletal muscle", unit: "kg", prev: 40.6, now: 41.3, goodUp: true },
    { label: "Visceral fat level", unit: "", prev: 9, now: 8, goodDown: true },
    { label: "Torso fat", unit: "kg", prev: 9.09, now: 8.19, goodDown: true },
    { label: "BMR", unit: "kcal", prev: 1942, now: 1966 },
    { label: "Evolt TEE", unit: "kcal", prev: 2990, now: 3027 },
    { label: "Waist", unit: "cm", prev: 85.2, now: 82.9, goodDown: true },
  ],
  segmental: [
    { part: "Arm", left: 4.39, right: 4.44, prevLeft: 4.53, prevRight: 4.45 },
    { part: "Leg", left: 10.39, right: 10.40, prevLeft: 9.74, prevRight: 9.84 },
    { part: "Torso", now: 32.19, prev: 32.34 },
  ],
};

const BODY = {
  lbm: 73.9,
  current: 86.9,
  target: 84.0,
  targetBf: 12,
  waistTarget: "80–81 cm",
  realTee: 2600,
};

const EVOLT_AUDIT = [
  { item: "BMR 1,966 kcal", verdict: "SOUND", tone: "good",
    detail: "Exactly Katch-McArdle: 370 + (21.6 × 73.9kg lean) = 1,966. Right formula when you have body comp — but only as good as the lean-mass input, and that input looks a little generous." },
  { item: "TEE 3,027 kcal", verdict: "TOO HIGH ~10–15%", tone: "bad",
    detail: "3,027 ÷ 1,966 = the same flat 1.54 'moderately active' multiplier as last scan — a questionnaire setting, not a measurement. Your real-world maintenance is still nearer ~2,600." },
  { item: "Calories 3,427–3,527", verdict: "IGNORE", tone: "bad",
    detail: "That panel is the MUSCLE GAIN recommendation — the goal toggle is still set to Muscle Gain, so it's TEE plus a bulking surplus. Roughly 800+ kcal above maintenance." },
  { item: "Protein 257–265g", verdict: "OVERSHOOT", tone: "warn",
    detail: "~3 g/kg. Useful protein tops out near 2.2 g/kg in a deficit — about 190–215g for you. The rest is just expensive calories." },
  { item: "Body fat 15.0%", verdict: "BROADLY RIGHT", tone: "good",
    detail: "Down from 16.7%, and the waist dropped 85.2 → 82.9 cm in the same period. Tape and scanner agree on direction — that's the part to trust." },
  { item: "Lean mass 73.9kg", verdict: "A LITTLE GENEROUS", tone: "warn",
    detail: "FFMI ~26.2 at 168cm is above the usual natural ceiling, and total body water rose 0.8kg between scans. Some of the +1.1kg is likely water. Direction is fine; the exact number is optimistic." },
];

const DAYS = {
  Push: {
    short: "Push",
    label: "Mon · Push — Chest, shoulders, triceps (~55 min)",
    warmup: ["Band Pull-Apart 1×20", "Band External Rotation 1×12/side", "Arm Circles + Shoulder CARs 1×10 each way", "1–2 light ramp-up sets on the Incline Press"],
    exercises: [
      { name: "Incline Press Machine", target: "4×6–8", rest: "2 min", key: true,
        execution: "Heaviest press of the week, done first. The machine removes the left-hand stabilising demand. Add weight once ALL 4 sets hit 8." },
      { name: "Single-Arm Cable Lateral Raise (LEFT first)", target: "3×12–15 per side", rest: "60 sec", isNew: true,
        execution: "Placed BETWEEN the two presses on purpose, so the shoulder press isn't done on already-tired pressing muscles. Cable at hand height, cuff strap on the left wrist so grip isn't involved. Lead with the elbow, stop at shoulder height. LEFT FIRST, right matches. Add weight once all sets hit 15." },
      { name: "Machine Shoulder Press", target: "3×8–10", rest: "90 sec",
        execution: "Full range of motion — the machine removes grip instability. Add weight once all 3 sets hit 10." },
      { name: "Pec Deck / Cable Fly", target: "3×12–15", rest: "60 sec",
        execution: "Chest isolation with no grip or balance demand. Squeeze and hold 1 sec at peak contraction." },
      { name: "Rope Tricep Pushdown", target: "3×12–15", rest: "60 sec (after pair)",
        execution: "Superset with the Overhead Extension. Rope is kinder on the left wrist than a straight bar. Elbows pinned to your sides." },
      { name: "Single-Arm Cable Overhead Tricep Extension (LEFT first)", target: "3×10–12 per side", rest: "60 sec (after pair)", isNew: true,
        execution: "Superset with Rope Pushdown. The overhead position stretches the long head — the biggest part of the tricep, which pushdowns underwork. Cable low, cuff or rope, face away, elbow pointing up and still. Lower to a stretch, extend fully. LEFT FIRST. Add weight once all sets hit 12." },
      { name: "Captain's Chair Leg Raise", target: "3×10–12", rest: "60 sec",
        execution: "Forearms on the pads — no grip or hanging needed. Once all 3 sets hit 12 with control, add a 2-second pause at the top before adding anything else." },
    ],
  },
  Pull: {
    short: "Pull",
    label: "Tue · Pull — Back, rear delts, biceps (~58 min)",
    warmup: ["Scapular Pulldown (light, straps) 1×12", "Band Face Pull 1×15", "Dead Hang (assisted) 1×20 sec"],
    exercises: [
      { name: "Lat Pulldown (wide, straps)", target: "4×6–8", rest: "2 min", key: true,
        execution: "Heaviest vertical pull of the week, done first. Straps on BOTH hands so grip never limits the load. Bar to collarbone, elbows down and back. Add weight once ALL 4 sets hit 8. LAST SET STRAPLESS at ~60–70% of working weight, to grip failure — log that weight separately." },
      { name: "Chest-Supported Row (straps)", target: "3×8–10", rest: "90 sec",
        execution: "The chest pad takes lower back and torso stability out of it, so the left hand only has to hold. Squeeze the shoulder blades together, hold 1 sec at the top. Add weight once all 3 sets hit 10." },
      { name: "Single-Arm Cable Row (strap, LEFT first)", target: "3×10 per side", rest: "60 sec",
        execution: "Cable at mid-chest height. Stand square and DO NOT let the torso rotate. Pull with the elbow, squeeze, control the return. LEFT ARM FIRST. Add weight once both sides hit 10 for all 3 sets." },
      { name: "Straight-Arm Pulldown (rope, straps)", target: "2×12–15", rest: "60 sec (after pair)",
        execution: "Superset with Rear Delt Fly (the fly gets a 3rd set on its own). Pure lat work with almost no grip and no biceps. Push the rope down and back with your armpits." },
      { name: "Rear Delt Fly Machine", target: "3×12–15", rest: "60 sec (after pair)",
        execution: "Superset with Straight-Arm Pulldown. Machine removes grip demand entirely. Rear delts are half of what makes a back look strong from behind." },
      { name: "Hammer Curl (neutral grip, LEFT first)", target: "3×10–12", rest: "60 sec", isNew: true,
        execution: "Now 3 sets. Neutral grip is easiest on the left wrist, and hammers build forearm mass that feeds back into grip. LEFT ARM FIRST, match the right to whatever the left managed. Add weight once all 3 sets hit 12." },
      { name: "Dead Hang (assisted)", target: "3×max sec", rest: "60 sec",
        execution: "Motor-control work for the left hand, not strength work. Three short honest holds beat one grinding max hold. Assist enough to hold 15–20 sec with an active shoulder. Add seconds first, then remove assistance." },
    ],
  },
  Legs: {
    short: "Legs",
    label: "Wed · Legs — Squat + unilateral leg, quad focus (~53 min)",
    warmup: ["90/90 Hip Rotations 1×8/side", "Bodyweight Squat 1×10", "Ankle Rocks 1×10/side"],
    exercises: [
      { name: "V-Squat Machine", target: "4×6–8", rest: "2 min", key: true, isNew: true,
        execution: "v8.1 — replaces Smith Machine Squat. Shoulder pads carry the load, so the left hand does nothing, and the back support removes balance as a limiter. Feet shoulder-width, mid-platform; sit back and down as deep as you can while keeping your lower back on the pad. Push evenly through both feet and watch that the left knee tracks over the toes. First session: find a working weight that leaves ~2 reps in reserve — the numbers won't match your Smith squat. Add weight once ALL 4 sets hit 8." },
      { name: "Leg Press", target: "3×8–10", rest: "90 sec",
        execution: "Feet shoulder-width. Push evenly through both feet — it's easy to quietly favour the right. Add weight once all 3 sets hit 10." },
      { name: "Bulgarian Split Squat / Walking Lunge", target: "3×8–10 per leg", rest: "75 sec",
        execution: "Default: SMITH MACHINE Bulgarian Split Squat — your go-to. The fixed bar path takes balance and grip out of it, so the working leg can push hard. Rear foot on a bench behind you, bar on your upper back, most of the weight on the front foot; drop straight down until the back knee nearly touches the floor. LEFT LEG FIRST, then match the right to whatever the left managed — log both sides. Add weight once both legs hit 10 for all 3 sets. (Name kept as-is so your logged history carries over.)" },
      { name: "Standing Calf Raise", target: "3×12–15", rest: "45 sec (after pair)",
        execution: "Superset with the Hip Abductor Machine. Slow eccentric, 3 seconds down." },
      { name: "Hip Abductor Machine", target: "3×12–15", rest: "45 sec (after pair)",
        execution: "Superset with Standing Calf Raise. LEAN YOUR TORSO SLIGHTLY FORWARD to bias glute medius over TFL. The machine moves both legs together, so it hides a left–right difference — the Split Squat and Single-Leg Stand are where you catch that. Add weight once all 3 sets hit 15." },
      { name: "Ab Crunch Machine (or Cable Crunch)", target: "3×12–15", rest: "60 sec",
        execution: "v7.1 — replaces Pallof Press. Seated, loaded, progresses on the stack. Curl the ribs toward the hips; don't just hinge at the hip with a straight spine. Pause 1 sec at the bottom. Add weight once all 3 sets hit 15." },
      { name: "Single-Leg Stand (left leg)", target: "2×30 sec", rest: "30 sec",
        execution: "Near a wall. Costs one minute and it's where you catch a left–right drift. Once 30 sec is stable, progress to eyes closed rather than adding load." },
    ],
  },
  Upper: {
    short: "Upper",
    label: "Fri · Upper — Horizontal pull + press, arms (~58 min)",
    warmup: ["Band Pull-Apart 1×20", "Band Face Pull 1×15", "Band External Rotation 1×12/side"],
    exercises: [
      { name: "Seated Cable Row / Machine High Row (straps)", target: "4×6–8", rest: "2 min", key: true,
        execution: "Pick one machine and stick with it for the whole block. Retract the shoulder blades FIRST, then pull with the elbows. Chest up, no rocking. Add weight once ALL 4 sets hit 8. LAST SET STRAPLESS at ~60–70%, to grip failure — log it separately." },
      { name: "Flat Machine Chest Press", target: "3×8–10", rest: "90 sec",
        execution: "Second chest day of the week, so it's moderate. Both arms — watch that the left handle isn't lagging behind the right. 2 sec down, 1 sec up. Add weight once all 3 sets hit 10." },
      { name: "Neutral-Grip Lat Pulldown (straps)", target: "3×10–12", rest: "90 sec", isNew: true,
        execution: "Second lat angle of the week. Neutral (palms-facing) handle, straps on both hands. Pull to upper chest, elbows tight to your sides. Lighter and higher-rep than Tuesday's wide pulldown. Add weight once all 3 sets hit 12." },
      { name: "Single-Arm Cable Lateral Raise (LEFT first)", target: "3×12–15 per side", rest: "60 sec (after pair)", isNew: true,
        execution: "Superset with Rear Delt Fly. Cuff strap on the left wrist. Lead with the elbow, stop at shoulder height. LEFT FIRST. Add weight once all sets hit 15." },
      { name: "Rear Delt Fly Machine", target: "2×15", rest: "60 sec (after pair)",
        execution: "Superset with the lateral raise (the raise gets a 3rd set on its own). Lighter than Tuesday — chase the squeeze, not the load." },
      { name: "Incline DB Curl or Cable Curl (LEFT first)", target: "3×10–12", rest: "60 sec (after pair)", isNew: true,
        execution: "Now 3 sets. Superset with Rope Pushdown. LEFT ARM FIRST, match the right to whatever the left managed. Add weight once all 3 sets hit 12." },
      { name: "Rope Tricep Pushdown", target: "2×12–15", rest: "60 sec (after pair)",
        execution: "Superset with the curl (the curl gets a 3rd set on its own). Lighter than Monday — 2 sets to finish the arms." },
    ],
  },
  Lower: {
    short: "Lower",
    label: "Sat · Lower — Hinge, posterior chain (~50 min)",
    warmup: ["90/90 Hip Rotations 1×8/side", "Broomstick Hip Hinge 1×10", "Glute Bridge 1×15"],
    exercises: [
      { name: "Romanian Deadlift (Smith, straps)", target: "4×6–8", rest: "2 min", key: true,
        execution: "Hinge, don't squat — push the hips back, soft knees, bar stays close. Add weight once ALL 4 sets hit 8." },
      { name: "Rack Pull (below knee, straps)", target: "3×5–6", rest: "2–3 min",
        execution: "Shortened range removes most of the grip stress while still loading the whole posterior chain heavy. Add weight once all 3 sets hit 6 with good form." },
      { name: "Hip Thrust Machine", target: "3×10–12", rest: "90 sec",
        execution: "Full hip extension, squeeze hard at the top." },
      { name: "Seated Leg Curl", target: "3×10–12", rest: "60 sec",
        execution: "Squeeze both legs equally at peak contraction." },
      { name: "Weighted Step-Up (40–50cm box)", target: "3×8 per leg", rest: "75 sec",
        execution: "Drive through the WHOLE foot on the box — don't push off the trailing leg. Left leg first. Dumbbells with straps, or hug a plate." },
      { name: "Wrist Curl (optional)", target: "2×12–15", rest: "45 sec (after pair)",
        execution: "Only if you're under time. Left arm first, match the right's reps." },
      { name: "Reverse Wrist Curl (optional)", target: "2×12–15", rest: "45 sec (after pair)",
        execution: "Only if you're under time. Left first." },
      { name: "Hip Adductor Machine (optional)", target: "2×12–15", rest: "45 sec",
        execution: "Start genuinely light — novel adductor work is a reliable source of DOMS. Control the eccentric. Add weight once both sets hit 15." },
    ],
  },
};

const RUN_PLAN = [
  { wk: 1, start: "2026-08-24", end: "2026-08-30",
    wed: "20 min total. 5 min easy warm-up, then 6 × 30 sec uphill push with a full walk back down between each, then 5 min easy.",
    sat: "3.0 km continuous, easy, flat. Don't race it. If you have to walk a section, walk it — finishing the distance is the point this week.",
    goal: "Establish the habit. Zero soreness target." },
  { wk: 2, start: "2026-08-31", end: "2026-09-06",
    wed: "22 min. Same structure, 8 × 30 sec uphill push.",
    sat: "3.5 km continuous, easy. Same route as week 1 if you can — it makes progress obvious.",
    goal: "Same effort, more work. Should feel easier than week 1." },
  { wk: 3, start: "2026-09-07", end: "2026-09-13",
    wed: "25 min. 6 × 60 sec hill at a hard-but-controlled effort, walk down to recover.",
    sat: "4.0 km. Run the last 1 km noticeably harder than the first 3.",
    goal: "First real intensity. Some leg soreness Thursday is fine." },
  { wk: 4, start: "2026-09-14", end: "2026-09-20",
    wed: "25 min. 8 × 60 sec hill.",
    sat: "5.0 km. Break it up: run 1 km, 100 m sandbag or backpack carry, repeat. First taste of the race pattern.",
    goal: "Race distance reached. Carries introduced. Wear your race shoes from here." },
  { wk: 5, start: "2026-09-21", end: "2026-09-27",
    wed: "25 min. 6 × 90 sec hill — longer intervals, same total work.",
    sat: "5.0 km + full obstacle simulation: 2 × 100 m carry, 2 × 20 m bear crawl, 2 × 30 burpees split across the run.",
    goal: "Dress rehearsal. Record your total time — this is your benchmark." },
  { wk: 6, start: "2026-09-28", end: "2026-10-04",
    wed: "PEAK WEEK. 22 min. 8 × 45 sec hard hill with short recovery.",
    sat: "6.0 km with carries plus 60 burpees split into 2 sets of 30. The hardest session of the block.",
    goal: "Deliberately harder than race day, so race day feels easier.", peak: true },
  { wk: 7, start: "2026-10-05", end: "2026-10-11",
    wed: "TAPER. 15 min easy + 4 × 20 sec relaxed strides. Nothing hard.",
    sat: "RACE DAY. If your race is later in October, do a 3 km easy shakeout and repeat this taper week until race week.",
    goal: "Arrive fresh. Doing less now costs you nothing.", taper: true },
];

const OBSTACLES = [
  { tier: "green", title: "NO GRIP NEEDED — these are yours", color: C.green,
    items: [
      { name: "Bucket Carry", how: "Wrap both arms fully around the bucket and hug it high on your chest. Short fast steps, don't lean back. Usually the hardest obstacle on the course for most people — and it never touches your hands." },
      { name: "Sandbag Carry", how: "Shoulder it on your RIGHT side and clamp with the right arm. Left hand steadies only." },
      { name: "Atlas Carry", how: "Hug the stone, squat to lift with a flat back, walk it, set it down, 5 burpees, carry it back." },
      { name: "Barbed Wire Crawl", how: "Roll sideways rather than army-crawling wherever the ground allows — faster and far less tiring. Head down." },
      { name: "Spear Throw", how: "Throw right-handed. Grip at the balance point, step through, follow through at the target. Practise this — most people fail on technique, not strength." },
      { name: "Cargo Net (A-frame / vertical)", how: "Your FEET do the work, hands only guide. Step on the vertical ropes near the knots, not the horizontals. Three points of contact." },
      { name: "Over-Under-Through Walls", how: "Over: plant a foot, drive up with the leg. Under: roll. Through: sit and swing your legs through." },
      { name: "Inverted Wall", how: "Get your heel over the top edge first, then let your leg pull you. Don't try to muscle it with your arms." },
      { name: "Fire Jump / Dunk Wall", how: "Straight run and jump; duck and exhale through the nose. Cold shock is the only real challenge." },
    ] },
  { tier: "amber", title: "GRIP HELPS, BUT THERE'S A TECHNIQUE — attempt every one", color: C.amber,
    items: [
      { name: "Hercules Hoist", how: "Wrap the rope around your forearm and around your body, then SIT BACK and use your bodyweight — don't pull hand-over-hand. Control the descent or you get a penalty. Genuinely attemptable for you." },
      { name: "Rope Climb", how: "Use the S-hook or J-hook foot lock. Done right, your feet carry about 70% of the load and your hands mostly stabilise. Learn the foot lock on the ground first." },
      { name: "Plate Drag", how: "Rope again — wrap it around your forearm, sit back, walk backwards. Very little finger grip needed." },
      { name: "Slip Wall", how: "Rope-assisted. Wrap the rope, run at the wall, let your legs do the climbing. Get your foot high early." },
      { name: "Stairway to Sparta", how: "A big wall with a ladder-ish top. Foot placement first, hands second." },
    ] },
  { tier: "red", title: "HEAVY GRIP — attempt anyway, but budget the burpees", color: C.danger,
    items: [
      { name: "Monkey Bars", how: "Attempt it — falling costs you nothing but the burpees you were going to do anyway. Go fast and swing; hanging static is what kills grip. If the left slips, you have your answer and you move on." },
      { name: "Multi-Rig", how: "Same approach. Momentum, not static hanging." },
      { name: "Olympus (traverse wall)", how: "Grip-and-hold on a slanted wall. Realistically a burpee obstacle for you right now." },
      { name: "Twister / Z-Wall", how: "Lateral hanging traverse. Same call." },
    ] },
];

const PROGRESSION_RULES = [
  "Trigger-based, not calendar-based — add weight when the rep target is met, not because a week passed.",
  "KEY LIFTS (4 sets): add weight once ALL 4 sets hit the top of the rep range with clean form.",
  "SECONDARY (3 sets): add weight once all 3 sets hit the top of the range.",
  "ACCESSORIES (2–3 sets): same rule; these can progress faster, lower risk.",
  "Increment: the smallest plate or pin jump available (2.5–5 kg). Bigger jumps buy missed reps, not faster progress.",
  "LEFT-PRIORITY RULE: log left and right separately, left goes first, and only progress the weight if your LEFT side can also hit the new target.",
  "CARRIES AND HOLDS: add TIME first. Once all sets hit the top of the time range, then add load.",
  "You're in a deficit, so recovery is taxed. Reps drop two sessions running on the same weight → hold the weight. Two weeks running → deload 10% for one week.",
];

const STOP_RULE = "STOP RULE: if your gait changes, your left side feels heavy or numb, your vision changes, or you get an unusual headache — stop the session. That's a medical signal, not a toughness test. Heat and hard exertion are the two conditions most likely to surface a problem, and the race has both. Get your doctor's sign-off on race participation specifically before October.";

// ============================ HELPERS ============================

function todayISO() { return new Date().toISOString().slice(0, 10); }
function emptySetRow() { return { reps: "", weight: "" }; }

function mondayOf(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}
function sundayOf(mondayISO) {
  const d = new Date(mondayISO + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}
function fmtShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}
function mealTotals(meal, mode) {
  return meal.foods.reduce((acc, f) => {
    const v = mode === "lift" && f.lift ? f.lift : f;
    return { kcal: acc.kcal + v.kcal, protein: acc.protein + v.protein, carbs: acc.carbs + v.carbs, fat: acc.fat + v.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

// ---- Weight trend chart: one series (amber solid + markers), one dashed reference line ----
function WeightChart({ data, target }) {
  if (!data || data.length < 2) return null;
  const W = 400, H = 150, PAD_L = 34, PAD_R = 14, PAD_T = 12, PAD_B = 22;
  const kgs = data.map((d) => d.kg).concat([target]);
  let lo = Math.min.apply(null, kgs), hi = Math.max.apply(null, kgs);
  const span = Math.max(hi - lo, 2);
  lo = lo - span * 0.12; hi = hi + span * 0.12;
  const x = (i) => PAD_L + (i / Math.max(data.length - 1, 1)) * (W - PAD_L - PAD_R);
  const y = (kg) => PAD_T + (1 - (kg - lo) / (hi - lo)) * (H - PAD_T - PAD_B);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.kg).toFixed(1)}`).join(" ");
  const ticks = [lo + (hi - lo) * 0.15, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.85];
  const showMarkers = data.length <= 30;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img"
         aria-label={`Body weight trend, ${data.length} weigh-ins, most recent ${data[data.length-1].kg} kg, target ${target} kg`}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={C.cardBorder} strokeWidth="1" />
          <text x={PAD_L - 6} y={y(t) + 3.5} textAnchor="end" fill={C.muted} fontSize="9">{t.toFixed(1)}</text>
        </g>
      ))}
      {/* reference line — dashed + directly labeled, so it is never distinguished by colour alone */}
      <line x1={PAD_L} x2={W - PAD_R} y1={y(target)} y2={y(target)} stroke={C.green} strokeWidth="2" strokeDasharray="5 4" />
      <text x={W - PAD_R} y={y(target) - 5} textAnchor="end" fill={C.green} fontSize="9.5" fontWeight="700">
        target {target} kg
      </text>
      <path d={path} fill="none" stroke={C.amber} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {showMarkers && data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.kg)} r="4" fill={C.amber} stroke={C.card} strokeWidth="2" />
      ))}
      <text x={PAD_L} y={H - 6} fill={C.muted} fontSize="9">{fmtShort(data[0].date)}</text>
      <text x={W - PAD_R} y={H - 6} textAnchor="end" fill={C.muted} fontSize="9">{fmtShort(data[data.length - 1].date)}</text>
    </svg>
  );
}

export default function LiftLog() {
  const [view, setView] = useState("log"); // log | week | history | food | body | race
  const [day, setDay] = useState("Push");
  const [entries, setEntries] = useState({});
  const [openEx, setOpenEx] = useState(() => new Set(DAYS.Push.exercises.map((e) => e.name)));
  const [lastValues, setLastValues] = useState({});
  const [sessions, setSessions] = useState([]);
  const [weeklyArchive, setWeeklyArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState({});
  const [error, setError] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState("");
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

  // ---- Food logging state ----
  const [todayLog, setTodayLog] = useState([]);
  const [logLoaded, setLogLoaded] = useState(false);
  const [foodQuery, setFoodQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualFood, setManualFood] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
  const [aiAvailable, setAiAvailable] = useState(true);
  const [foodHistory, setFoodHistory] = useState([]);
  const [expandedLogDate, setExpandedLogDate] = useState(null);
  const [logDateDetail, setLogDateDetail] = useState({});
  const [confirmingFoodReset, setConfirmingFoodReset] = useState(false);
  const [archivingFood, setArchivingFood] = useState(false);
  const [archiveFoodMsg, setArchiveFoodMsg] = useState("");
  const [dayMode, setDayMode] = useState(() => (RUN_DAY_INDEXES.includes(new Date().getDay()) ? "run" : "lift"));
  const [showSwaps, setShowSwaps] = useState(false);

  // ---- Weight tracking state ----
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [openAudit, setOpenAudit] = useState(null);
  const [openTier, setOpenTier] = useState("green");
  const [showRules, setShowRules] = useState(false);

  const target = dayMode === "run" ? NUTRITION.runTarget : NUTRITION.liftTarget;

  const exportBackup = async () => {
    setError("");
    try {
      const listRes = await window.storage.list("", false);
      const keys = listRes ? listRes.keys : [];
      const data = {};
      for (const k of keys) {
        try { const res = await window.storage.get(k, false); data[k] = res.value; } catch (e) {}
      }
      const payload = { exportedAt: new Date().toISOString(), data };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `lift-log-backup-${todayISO()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { setError("Couldn't create a backup file. Try again."); }
  };

  const importBackup = async (file) => {
    setRestoring(true); setError("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed && parsed.data ? parsed.data : parsed;
      const entriesToWrite = Object.entries(data || {});
      if (entriesToWrite.length === 0) throw new Error("empty backup");
      for (const [k, v] of entriesToWrite) await window.storage.set(k, v, false);
      await loadAll(); await loadWeights();
      setArchiveMsg("Backup restored successfully.");
      setTimeout(() => setArchiveMsg(""), 4000);
    } catch (e) { setError("Couldn't restore that file — make sure it's a Lift Log backup."); }
    finally { setRestoring(false); }
  };

  const [draftReady, setDraftReady] = useState(false);
  const draftSaveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setDraftReady(false);
    (async () => {
      let initial = {};
      DAYS[day].exercises.forEach((e) => { initial[e.name] = [emptySetRow()]; });
      try {
        const res = await window.storage.get(`draft:${day}`, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          DAYS[day].exercises.forEach((e) => { if (!parsed[e.name]) parsed[e.name] = [emptySetRow()]; });
          initial = parsed;
        }
      } catch (e) {}
      if (!cancelled) {
        setEntries(initial);
        setOpenEx(new Set(DAYS[day].exercises.map((e) => e.name)));
        setSaved(false); setDraftReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [day]);

  useEffect(() => {
    if (!draftReady) return;
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => {
      window.storage.set(`draft:${day}`, JSON.stringify(entries), false).catch(() => {});
    }, 400);
    return () => { if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current); };
  }, [entries, day, draftReady]);

  const loadAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const idxRes = await window.storage.get("sessions-index", false).catch(() => null);
      setSessions(idxRes ? JSON.parse(idxRes.value) : []);
      const lvRes = await window.storage.get("last-values", false).catch(() => null);
      setLastValues(lvRes ? JSON.parse(lvRes.value) : {});
      const waRes = await window.storage.get("weekly-archive-index", false).catch(() => null);
      setWeeklyArchive(waRes ? JSON.parse(waRes.value) : []);
    } catch (e) { setError("Couldn't load saved data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadWeights = useCallback(async () => {
    try {
      const res = await window.storage.get("weight-log", false).catch(() => null);
      const arr = res ? JSON.parse(res.value) : [];
      arr.sort((a, b) => a.date.localeCompare(b.date));
      setWeights(arr);
    } catch (e) { setWeights([]); }
  }, []);
  useEffect(() => { loadWeights(); }, [loadWeights]);

  const saveWeight = async () => {
    const kg = parseFloat(weightInput);
    if (!kg || kg < 30 || kg > 250) { setError("Enter a weight in kg."); return; }
    setSavingWeight(true); setError("");
    try {
      const next = weights.filter((w) => w.date !== todayISO()).concat([{ date: todayISO(), kg: Math.round(kg * 10) / 10 }]);
      next.sort((a, b) => a.date.localeCompare(b.date));
      await window.storage.set("weight-log", JSON.stringify(next), false);
      setWeights(next); setWeightInput("");
    } catch (e) { setError("Couldn't save that weigh-in."); }
    finally { setSavingWeight(false); }
  };

  const deleteWeight = async (date) => {
    const next = weights.filter((w) => w.date !== date);
    await window.storage.set("weight-log", JSON.stringify(next), false).catch(() => {});
    setWeights(next);
  };

  // 7-day rolling averages
  const t = todayISO();
  const win = (from, to) => weights.filter((w) => { const d = daysBetween(w.date, t); return d >= from && d <= to; });
  const cur7 = win(0, 6), prev7 = win(7, 13);
  const mean = (a) => (a.length ? a.reduce((s, w) => s + w.kg, 0) / a.length : null);
  const avgNow = mean(cur7), avgPrev = mean(prev7);
  const weeklyRate = avgNow !== null && avgPrev !== null ? avgNow - avgPrev : null;
  const latest = weights.length ? weights[weights.length - 1] : null;

  let rateAdvice = null, rateTone = C.muted;
  if (weeklyRate !== null) {
    const drop = -weeklyRate;
    if (cur7.length < 3 || prev7.length < 3) {
      rateAdvice = "Keep logging — you need about 3 weigh-ins in each of the last two weeks before the trend means anything.";
    } else if (drop < 0.15) {
      rateAdvice = "Barely moving. If this holds for another week, take 150 kcal off the daily target."; rateTone = C.amber;
    } else if (drop > 0.6) {
      rateAdvice = "Dropping faster than 0.6 kg/week — that's the zone where you start losing muscle. Add 150 kcal."; rateTone = C.danger;
    } else {
      rateAdvice = "Right in the target band of 0.3–0.4 kg/week. Don't change anything."; rateTone = C.green;
    }
  }

  const toGo = latest ? Math.round((latest.kg - BODY.target) * 10) / 10 : Math.round((BODY.current - BODY.target) * 10) / 10;
  const weeksToGo = toGo > 0 ? Math.ceil(toGo / 0.38) : 0;

  const loadFoodLog = useCallback(async () => {
    try {
      const res = await window.storage.get(`foodlog:${todayISO()}`, false).catch(() => null);
      setTodayLog(res ? JSON.parse(res.value) : []);
      const idxRes = await window.storage.get("foodlog-index", false).catch(() => null);
      setFoodHistory(idxRes ? JSON.parse(idxRes.value) : []);
    } catch (e) { setTodayLog([]); }
    finally { setLogLoaded(true); }
  }, []);
  useEffect(() => { loadFoodLog(); }, [loadFoodLog]);

  const saveFoodLog = async (updated) => {
    setTodayLog(updated);
    const date = todayISO(); const key = date;
    await window.storage.set(`foodlog:${key}`, JSON.stringify(updated), false).catch(() => {});
    const totals = updated.reduce((acc, f) => ({
      kcal: acc.kcal + f.kcal, protein: acc.protein + f.protein, carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    const newIndex = [{ key, date, ...totals, items: updated.length, archived: false }, ...foodHistory.filter((d) => d.key !== key)]
      .sort((a, b) => (b.date + (b.archived ? "z" : "a")).localeCompare(a.date + (a.archived ? "z" : "a"))).slice(0, 150);
    setFoodHistory(newIndex);
    await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});
    setLogDateDetail((prev) => ({ ...prev, [key]: updated }));
  };

  const addFoodEntry = async (entry) => {
    await saveFoodLog([...todayLog, {
      name: entry.name || "Food",
      kcal: Math.round(Number(entry.kcal) || 0),
      protein: Math.round(Number(entry.protein) || 0),
      carbs: Math.round(Number(entry.carbs) || 0),
      fat: Math.round(Number(entry.fat) || 0),
      source: entry.source || "manual entry",
      loggedAt: new Date().toISOString(),
    }]);
  };
  const deleteFoodEntry = async (idx) => { await saveFoodLog(todayLog.filter((_, i) => i !== idx)); };

  const addMealToLog = async (meal) => {
    const tot = mealTotals(meal, dayMode);
    await addFoodEntry({ name: meal.name.replace(/ —.*/, "") + (dayMode === "lift" ? " (lift day)" : " (run day)"),
      kcal: tot.kcal, protein: tot.protein, carbs: tot.carbs, fat: tot.fat, source: "plan meal" });
  };

  const loadLogDateDetail = async (key) => {
    if (logDateDetail[key]) { setExpandedLogDate(expandedLogDate === key ? null : key); return; }
    try {
      const res = await window.storage.get(`foodlog:${key}`, false);
      setLogDateDetail((prev) => ({ ...prev, [key]: res ? JSON.parse(res.value) : [] })); setExpandedLogDate(key);
    } catch (e) { setLogDateDetail((prev) => ({ ...prev, [key]: [] })); setExpandedLogDate(key); }
  };

  const deleteLogDate = async (key) => {
    try {
      await window.storage.delete(`foodlog:${key}`, false).catch(() => {});
      const newIndex = foodHistory.filter((d) => d.key !== key);
      setFoodHistory(newIndex);
      await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});
      if (expandedLogDate === key) setExpandedLogDate(null);
    } catch (e) {}
  };

  const archiveTodayAndReset = async () => {
    if (todayLog.length === 0) return;
    setArchivingFood(true);
    const date = todayISO(); const archiveKey = `archive:${date}:${Date.now()}`;
    const snapshot = todayLog; const totals = todayTotals;
    try {
      const ok = await window.storage.set(`foodlog:${archiveKey}`, JSON.stringify(snapshot), false);
      if (!ok) throw new Error("archive save failed");
      const archivedEntry = { key: archiveKey, date, kcal: totals.kcal, protein: totals.protein, carbs: totals.carbs, fat: totals.fat, items: snapshot.length, archived: true };
      const liveKey = date;
      const liveEntry = { key: liveKey, date, kcal: 0, protein: 0, carbs: 0, fat: 0, items: 0, archived: false };
      await window.storage.set(`foodlog:${liveKey}`, JSON.stringify([]), false).catch(() => {});
      const newIndex = [archivedEntry, liveEntry, ...foodHistory.filter((d) => d.key !== archiveKey && d.key !== liveKey)]
        .sort((a, b) => (b.date + (b.archived ? "z" : "a")).localeCompare(a.date + (a.archived ? "z" : "a"))).slice(0, 150);
      await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});
      setFoodHistory(newIndex); setTodayLog([]);
      setLogDateDetail((prev) => ({ ...prev, [archiveKey]: snapshot, [liveKey]: [] }));
      setConfirmingFoodReset(false);
      setArchiveFoodMsg(`Today's log archived (${totals.kcal.toLocaleString()} kcal) and reset.`);
      setTimeout(() => setArchiveFoodMsg(""), 4000);
    } catch (e) { setLookupError("Couldn't archive today's log. Try again."); }
    finally { setArchivingFood(false); }
  };

  const handleLookup = async () => {
    const query = foodQuery.trim();
    if (!query) return;
    setLookupLoading(true); setLookupError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1024,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Log nutrition for: "${query}".

If this is a specific chain restaurant item, branded packaged food, or anything with an official published nutrition label, SEARCH THE WEB for the real figures first — don't estimate from memory. Pay close attention to exact variant (e.g. patty size, "no mayo", added extras) and add/subtract components precisely rather than guessing a round number. For plain home-cooked or generic foods without a brand, standard USDA-style estimates are fine without searching.

After you have the real numbers, respond with ONLY a raw JSON object as your final message, no markdown fences, no explanation before or after it:
{"name": "short food name", "kcal": number, "protein": number, "carbs": number, "fat": number, "source": "short source note"}` }],
        }),
      });
      if (!response.ok) throw new Error("api unavailable");
      const data = await response.json();
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      await addFoodEntry(JSON.parse(jsonMatch ? jsonMatch[0] : clean));
      setFoodQuery(""); setAiAvailable(true);
    } catch (e) {
      setAiAvailable(false); setManualMode(true);
      setManualFood((prev) => ({ ...prev, name: query }));
      setLookupError("AI lookup isn't available here — enter the macros manually below.");
    } finally { setLookupLoading(false); }
  };

  const handleManualAdd = async () => {
    if (!manualFood.name.trim()) { setLookupError("Give the food a name first."); return; }
    await addFoodEntry(manualFood);
    setManualFood({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
    setManualMode(false); setLookupError(""); setFoodQuery("");
  };

  const todayTotals = todayLog.reduce((acc, f) => ({
    kcal: acc.kcal + f.kcal, protein: acc.protein + f.protein, carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  const currentWeekMonday = mondayOf(todayISO());
  const currentWeekSunday = sundayOf(currentWeekMonday);
  const currentWeekSessions = sessions.filter((s) => mondayOf(s.date) === currentWeekMonday);

  useEffect(() => {
    if (view !== "week") return;
    const missing = currentWeekSessions.filter((s) => !sessionDetail[s.key]);
    if (missing.length === 0) return;
    (async () => {
      const updates = {};
      for (const s of missing) {
        try { const res = await window.storage.get(s.key, false); updates[s.key] = res ? JSON.parse(res.value) : null; }
        catch (e) { updates[s.key] = null; }
      }
      setSessionDetail((prev) => ({ ...prev, ...updates }));
    })();
  }, [view, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOpen = (name) => setOpenEx((prev) => {
    const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next;
  });
  const updateSet = (exName, idx, field, value) => setEntries((prev) => {
    const rows = [...prev[exName]]; rows[idx] = { ...rows[idx], [field]: value };
    return { ...prev, [exName]: rows };
  });
  const addSet = (exName) => setEntries((prev) => ({ ...prev, [exName]: [...prev[exName], emptySetRow()] }));
  const removeSet = (exName, idx) => setEntries((prev) => {
    const rows = prev[exName].filter((_, i) => i !== idx);
    return { ...prev, [exName]: rows.length ? rows : [emptySetRow()] };
  });

  const totalVolume = Object.values(entries).reduce((sum, rows) =>
    sum + rows.reduce((s, r) => s + (parseFloat(r.reps) || 0) * (parseFloat(r.weight) || 0), 0), 0);
  const loggedSetCount = Object.values(entries).reduce((n, rows) =>
    n + rows.filter((r) => r.reps !== "" || r.weight !== "").length, 0);

  const saveWorkout = async () => {
    setSaving(true); setError("");
    try {
      const cleanEntries = {}; let setCount = 0;
      Object.entries(entries).forEach(([name, rows]) => {
        const filled = rows.filter((r) => r.reps !== "" || r.weight !== "");
        if (filled.length) { cleanEntries[name] = filled; setCount += filled.length; }
      });
      if (Object.keys(cleanEntries).length === 0) { setError("Log at least one set before saving."); setSaving(false); return; }
      const key = `session:${Date.now()}`;
      const record = { key, date: todayISO(), day, entries: cleanEntries, totalVolume, totalSets: setCount };
      const res = await window.storage.set(key, JSON.stringify(record), false);
      if (!res) throw new Error("save failed");
      const newIndex = [{ key, date: record.date, day, totalVolume, totalSets: setCount }, ...sessions].slice(0, 500);
      await window.storage.set("sessions-index", JSON.stringify(newIndex), false);
      setSessions(newIndex);
      setSessionDetail((prev) => ({ ...prev, [key]: record }));
      const newLastValues = { ...lastValues };
      Object.entries(cleanEntries).forEach(([name, rows]) => {
        const last = rows[rows.length - 1];
        newLastValues[name] = { reps: last.reps, weight: last.weight, date: record.date };
      });
      await window.storage.set("last-values", JSON.stringify(newLastValues), false);
      setLastValues(newLastValues);
      await window.storage.delete(`draft:${day}`, false).catch(() => {});
      const freshEntries = {};
      DAYS[day].exercises.forEach((e) => { freshEntries[e.name] = [emptySetRow()]; });
      setEntries(freshEntries);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { setError("Couldn't save. Try again."); }
    finally { setSaving(false); }
  };

  const loadSessionDetail = async (key) => {
    if (sessionDetail[key]) { setExpandedSession(expandedSession === key ? null : key); return; }
    try {
      const res = await window.storage.get(key, false);
      setSessionDetail((prev) => ({ ...prev, [key]: res ? JSON.parse(res.value) : null })); setExpandedSession(key);
    } catch (e) { setError("Couldn't load that session."); }
  };

  const deleteSession = async (key) => {
    try {
      await window.storage.delete(key, false);
      const newIndex = sessions.filter((s) => s.key !== key);
      await window.storage.set("sessions-index", JSON.stringify(newIndex), false);
      setSessions(newIndex);
      if (expandedSession === key) setExpandedSession(null);
    } catch (e) { setError("Couldn't delete that session."); }
  };

  const weekAgg = { totalVolume: 0, totalSets: 0, sessionsCount: currentWeekSessions.length, perExercise: {} };
  currentWeekSessions.forEach((s) => {
    const detail = sessionDetail[s.key];
    weekAgg.totalVolume += s.totalVolume || 0;
    weekAgg.totalSets += s.totalSets || 0;
    if (detail) {
      Object.entries(detail.entries).forEach(([name, rows]) => {
        if (!weekAgg.perExercise[name]) weekAgg.perExercise[name] = { volume: 0, sets: 0, bestWeight: 0 };
        rows.forEach((r) => {
          const reps = parseFloat(r.reps) || 0, weight = parseFloat(r.weight) || 0;
          weekAgg.perExercise[name].volume += reps * weight;
          weekAgg.perExercise[name].sets += 1;
          if (weight > weekAgg.perExercise[name].bestWeight) weekAgg.perExercise[name].bestWeight = weight;
        });
      });
    }
  });

  const archiveAndResetWeek = async () => {
    setArchiving(true); setError("");
    const weekSessionKeys = currentWeekSessions.map((s) => s.key);
    try {
      const summary = { weekKey: currentWeekMonday, startDate: currentWeekMonday, endDate: currentWeekSunday,
        totalVolume: weekAgg.totalVolume, totalSets: weekAgg.totalSets, sessionsCount: weekAgg.sessionsCount,
        perExercise: weekAgg.perExercise, archivedAt: new Date().toISOString() };
      const ok = await window.storage.set(`weekly-archive:${currentWeekMonday}`, JSON.stringify(summary), false);
      if (!ok) throw new Error("summary save failed");
      const newArchiveIndex = [{ weekKey: currentWeekMonday, startDate: currentWeekMonday, endDate: currentWeekSunday,
        totalVolume: weekAgg.totalVolume, totalSets: weekAgg.totalSets, sessionsCount: weekAgg.sessionsCount },
        ...weeklyArchive.filter((w) => w.weekKey !== currentWeekMonday)].slice(0, 100);
      const ok2 = await window.storage.set("weekly-archive-index", JSON.stringify(newArchiveIndex), false);
      if (!ok2) throw new Error("archive index save failed");
      setWeeklyArchive(newArchiveIndex);
    } catch (e) {
      setError("Couldn't save this week's summary — reset was not performed, nothing was lost. Try again.");
      setArchiving(false); return;
    }
    for (const key of weekSessionKeys) { try { await window.storage.delete(key, false); } catch (e) {} }
    try {
      const remainingIndex = sessions.filter((s) => !weekSessionKeys.includes(s.key));
      const ok = await window.storage.set("sessions-index", JSON.stringify(remainingIndex), false);
      if (!ok) throw new Error("index update failed");
      setSessions(remainingIndex);
      setSessionDetail((prev) => { const next = { ...prev }; weekSessionKeys.forEach((k) => delete next[k]); return next; });
      await loadAll();
      setConfirmingReset(false);
      setArchiveMsg(`Week of ${fmtShort(currentWeekMonday)} archived and reset.`);
      setTimeout(() => setArchiveMsg(""), 4000);
    } catch (e) { setError("Summary was saved, but resetting this week's log didn't fully complete. Try archiving again."); }
    finally { setArchiving(false); }
  };

  const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 3, padding: "7px 2px", borderRadius: 10, fontSize: 10, fontWeight: 700,
      border: `1px solid ${view === id ? C.amber : C.cardBorder}`,
      background: view === id ? C.amberSoft : "transparent",
      color: view === id ? C.amber : C.muted,
    }}>
      <Icon size={14} />{label}
    </button>
  );

  const Card = ({ children, accent, style }) => (
    <div style={{ background: C.card, border: `1px solid ${accent || C.cardBorder}`, borderRadius: 14, padding: 16, ...style }}>
      {children}
    </div>
  );
  const Eyebrow = ({ children, color }) => (
    <div style={{ fontSize: 11, color: color || C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: fontStack, minHeight: "100%", paddingBottom: view === "log" ? 96 : 32 }} className="w-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-3" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-baseline justify-between">
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Lift Log</div>
          <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, letterSpacing: "0.04em" }}>PLAN v8.1 · PPLUL</div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 12 }}>
          {view === "log" ? "Log today's sets"
            : view === "history" ? "Session history"
            : view === "food" ? "Nutrition & food log"
            : view === "body" ? "Weight trend & body composition"
            : view === "race" ? "Run plan & obstacle strategy"
            : "Weekly summary"}
        </div>
        <div className="flex gap-1.5" style={{ marginBottom: 6 }}>
          <TabButton id="log" icon={Dumbbell} label="Log" />
          <TabButton id="week" icon={Calendar} label="Week" />
          <TabButton id="history" icon={History} label="History" />
        </div>
        <div className="flex gap-1.5">
          <TabButton id="food" icon={Utensils} label="Food" />
          <TabButton id="body" icon={Scale} label="Body" />
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 px-3 py-2" style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 8, fontSize: 12.5, color: "#E8B79C" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-10 text-center" style={{ color: C.muted, fontSize: 13 }}>Loading your data…</div>
      ) : view === "log" ? (
        <>
          <div className="flex gap-1.5 px-5 pt-4">
            {Object.keys(DAYS).map((d) => (
              <button key={d} onClick={() => setDay(d)} style={{
                flex: 1, padding: "9px 2px", borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                border: `1px solid ${day === d ? C.amber : C.cardBorder}`,
                background: day === d ? C.amberSoft : "transparent",
                color: day === d ? C.amber : C.muted,
              }}>{DAYS[d].short}</button>
            ))}
          </div>
          <div className="px-5 pt-1 pb-2" style={{ fontSize: 12, color: C.muted }}>{DAYS[day].label}</div>

          {DAYS[day].warmup && (
            <div className="px-5 pb-1">
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                  Warm-up · not logged
                </div>
                {DAYS[day].warmup.map((w) => (
                  <div key={w} style={{ fontSize: 12, color: C.text, padding: "2px 0" }}>· {w}</div>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 flex flex-col gap-3 mt-2">
            {DAYS[day].exercises.map((ex) => {
              const rows = entries[ex.name] || [];
              const isOpen = openEx.has(ex.name);
              const last = lastValues[ex.name];
              return (
                <div key={ex.name} style={{ background: C.card, border: `1px solid ${ex.key ? C.amber : C.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
                  <button onClick={() => toggleOpen(ex.name)} className="w-full flex items-center justify-between px-4 py-3" style={{ background: "transparent" }}>
                    <div className="text-left">
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                        {ex.name}
                        {ex.key && <span style={{ marginLeft: 8, fontSize: 10, color: C.amber, fontWeight: 800, letterSpacing: "0.04em" }}>KEY LIFT</span>}
                        {ex.isNew && <span style={{ marginLeft: 8, fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: "0.04em" }}>NEW</span>}
                        {ex.moved && <span style={{ marginLeft: 8, fontSize: 10, color: C.blue, fontWeight: 800, letterSpacing: "0.04em" }}>MOVED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        target {ex.target}
                        {ex.rest && <span>{"  ·  rest "}{ex.rest}</span>}
                        {last && <span>{"  ·  last: "}{last.reps || "–"} reps @ {last.weight || "–"}kg</span>}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4">
                      {ex.execution && (
                        <div style={{ fontSize: 12, color: C.text, background: C.bg, borderLeft: `3px solid ${ex.isNew ? C.green : ex.moved ? C.blue : C.amber}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12, lineHeight: 1.45 }}>
                          {ex.execution}
                        </div>
                      )}
                      <div className="grid grid-cols-12 gap-2 pb-1.5" style={{ fontSize: 11, color: C.muted }}>
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Reps</div>
                        <div className="col-span-4">Weight (kg)</div>
                        <div className="col-span-3"></div>
                      </div>
                      {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                          <div className="col-span-1" style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>{i + 1}</div>
                          <input className="col-span-4" inputMode="numeric" placeholder="0" value={row.reps}
                            onChange={(e) => updateSet(ex.name, i, "reps", e.target.value.replace(/[^0-9]/g, ""))}
                            style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14, width: "100%" }} />
                          <input className="col-span-4" inputMode="decimal" placeholder="0" value={row.weight}
                            onChange={(e) => updateSet(ex.name, i, "weight", e.target.value.replace(/[^0-9.]/g, ""))}
                            style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14, width: "100%" }} />
                          <div className="col-span-3 flex justify-end">
                            <button onClick={() => removeSet(ex.name, i)} style={{ color: C.muted, padding: 6 }} aria-label="Remove set"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addSet(ex.name)} className="flex items-center gap-1.5 mt-1" style={{ color: C.amber, fontSize: 12.5, fontWeight: 700 }}>
                        <Plus size={14} /> Add set
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 12, padding: "12px 14px", fontSize: 11.5, color: "#E8B79C", lineHeight: 1.5 }}>
              {STOP_RULE}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between" style={{ padding: "11px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Progression rules</div>
                {showRules ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
              </button>
              {showRules && (
                <div style={{ padding: "0 14px 14px" }}>
                  {PROGRESSION_RULES.map((r, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: C.text, padding: "5px 0", borderTop: `1px solid ${C.cardBorder}`, lineHeight: 1.45 }}>· {r}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: C.card, borderTop: `1px solid ${C.cardBorder}`,
            paddingTop: 12, paddingLeft: 20, paddingRight: 20, paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
            display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 480, margin: "0 auto" }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted }}>{loggedSetCount} sets logged</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{totalVolume.toLocaleString()} kg total volume</div>
            </div>
            <button onClick={saveWorkout} disabled={saving} style={{
              background: saved ? C.green : C.amber, color: "#12151A", fontWeight: 800, fontSize: 13.5,
              borderRadius: 10, padding: "11px 18px", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saved ? (<><Check size={16} /> Saved</>) : saving ? "Saving…" : "Save workout"}
            </button>
          </div>
        </>
      ) : view === "week" ? (
        <div className="px-5 pt-4 flex flex-col gap-4">
          {archiveMsg && (
            <div className="px-3 py-2" style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8, fontSize: 12.5, color: "#B7E0C6" }}>{archiveMsg}</div>
          )}
          <Card>
            <Eyebrow>This week · {fmtShort(currentWeekMonday)} – {fmtShort(currentWeekSunday)}</Eyebrow>
            <div className="flex gap-6 mt-2">
              <div><div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.totalVolume.toLocaleString()}</div><div style={{ fontSize: 11, color: C.muted }}>kg volume</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.totalSets}</div><div style={{ fontSize: 11, color: C.muted }}>sets</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.sessionsCount}</div><div style={{ fontSize: 11, color: C.muted }}>sessions</div></div>
            </div>
            {Object.keys(weekAgg.perExercise).length > 0 && (
              <div className="mt-4">
                {Object.entries(weekAgg.perExercise).map(([name, agg]) => (
                  <div key={name} className="flex items-center justify-between py-1.5" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                    <div style={{ fontSize: 12.5 }}>{name}</div>
                    <div style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>best {agg.bestWeight || "–"}kg · {agg.volume.toLocaleString()}kg</div>
                  </div>
                ))}
              </div>
            )}
            {weekAgg.sessionsCount === 0 && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10 }}>No sessions logged this week yet.</div>}
            <div className="mt-4" style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 12 }}>
              {!confirmingReset ? (
                <button onClick={() => setConfirmingReset(true)} disabled={weekAgg.sessionsCount === 0} className="flex items-center gap-2"
                  style={{ fontSize: 12.5, fontWeight: 700, color: weekAgg.sessionsCount === 0 ? C.muted : C.amber, opacity: weekAgg.sessionsCount === 0 ? 0.5 : 1 }}>
                  <Archive size={14} /> Archive &amp; reset this week
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: C.text, marginBottom: 8 }}>
                    This saves the week's totals permanently, then clears this week's individual sessions. Saved totals can't be un-reset — continue?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={archiveAndResetWeek} disabled={archiving} style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>
                      {archiving ? "Archiving…" : "Confirm"}
                    </button>
                    <button onClick={() => setConfirmingReset(false)} style={{ border: `1px solid ${C.cardBorder}`, color: C.muted, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div>
            <Eyebrow>Past weeks</Eyebrow>
            {weeklyArchive.length === 0 && <div style={{ fontSize: 12.5, color: C.muted }}>No archived weeks yet.</div>}
            <div className="flex flex-col gap-2">
              {weeklyArchive.map((w) => (
                <div key={w.weekKey} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px" }} className="flex items-center justify-between">
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{fmtShort(w.startDate)} – {fmtShort(w.endDate)}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{w.totalVolume.toLocaleString()}kg · {w.totalSets} sets · {w.sessionsCount} sessions</div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Backup your data</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
              iPhone can occasionally clear storage for home-screen apps like this one that aren't backed by a server. Export a backup after archiving each week — it now includes your weigh-ins too.
            </div>
            <div className="flex gap-2">
              <button onClick={exportBackup} style={{ background: C.amberSoft, color: C.amber, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "9px 14px" }}>Export backup</button>
              <button onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={restoring}
                style={{ border: `1px solid ${C.cardBorder}`, color: C.text, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "9px 14px", opacity: restoring ? 0.6 : 1 }}>
                {restoring ? "Restoring…" : "Restore from file"}
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) importBackup(f); e.target.value = ""; }} />
            </div>
          </Card>
        </div>
      ) : view === "history" ? (
        <div className="px-5 pt-4 flex flex-col gap-3">
          {sessions.length === 0 && (
            <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>
              No sessions logged yet. Head to the Log tab and save your first workout.
            </div>
          )}
          {sessions.map((s) => {
            const isOpen = expandedSession === s.key;
            const detail = sessionDetail[s.key];
            return (
              <div key={s.key} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => loadSessionDetail(s.key)} className="w-full flex items-center justify-between px-4 py-3">
                  <div className="text-left">
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{(DAYS[s.day] && DAYS[s.day].short) || LEGACY_DAY_NAMES[s.day] || s.day}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.date} · {s.totalVolume.toLocaleString()} kg volume</div>
                  </div>
                  {isOpen ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
                </button>
                {isOpen && detail && (
                  <div className="px-4 pb-4">
                    {Object.entries(detail.entries).map(([name, rows]) => (
                      <div key={name} className="mb-2.5">
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                        <div style={{ fontSize: 12.5, color: C.muted }}>{rows.map((r) => `${r.reps || "–"}×${r.weight || "–"}kg`).join("  ·  ")}</div>
                      </div>
                    ))}
                    <button onClick={() => deleteSession(s.key)} className="flex items-center gap-1.5 mt-2" style={{ color: C.danger, fontSize: 12, fontWeight: 700 }}>
                      <X size={13} /> Delete session
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : view === "body" ? (
        <div className="px-5 pt-4 flex flex-col gap-4">
          {/* Weigh-in */}
          <Card accent={C.amber}>
            <Eyebrow>Today's weigh-in</Eyebrow>
            <div className="flex gap-2" style={{ marginBottom: 10 }}>
              <input inputMode="decimal" value={weightInput} placeholder={latest ? String(latest.kg) : "87.4"}
                onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && saveWeight()}
                style={{ flex: 1, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 16, fontWeight: 700 }} />
              <button onClick={saveWeight} disabled={savingWeight || !weightInput}
                style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "10px 16px", opacity: savingWeight || !weightInput ? 0.6 : 1, whiteSpace: "nowrap" }}>
                {savingWeight ? "Saving…" : "Log kg"}
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>
              First thing in the morning, after the toilet, before food. A single day means nothing — the 7-day average is the number that decides whether calories move.
            </div>
          </Card>

          {/* Trend */}
          <Card>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Body weight trend</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{weights.length} weigh-in{weights.length === 1 ? "" : "s"}</div>
            </div>
            {weights.length < 2 ? (
              <div style={{ fontSize: 12.5, color: C.muted, padding: "16px 0", lineHeight: 1.5 }}>
                Log at least two weigh-ins and the trend line appears here, with your {BODY.target} kg target marked.
              </div>
            ) : (
              <WeightChart data={weights} target={BODY.target} />
            )}
            <div className="flex gap-5" style={{ marginTop: 12, borderTop: `1px solid ${C.cardBorder}`, paddingTop: 12 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{avgNow !== null ? avgNow.toFixed(1) : "–"}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>7-day avg</div>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: weeklyRate !== null ? rateTone : C.text }}>
                  {weeklyRate !== null ? (weeklyRate > 0 ? "+" : "") + weeklyRate.toFixed(2) : "–"}
                </div>
                <div style={{ fontSize: 10.5, color: C.muted }}>kg / week</div>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{toGo > 0 ? toGo.toFixed(1) : "0"}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>kg to target</div>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{weeksToGo || "–"}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>weeks est.</div>
              </div>
            </div>
            {rateAdvice && (
              <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 8, fontSize: 12, lineHeight: 1.45,
                background: rateTone === C.green ? C.greenSoft : rateTone === C.danger ? C.dangerSoft : C.amberSoft,
                border: `1px solid ${rateTone}`, color: C.text }}>
                {rateAdvice}
              </div>
            )}
            {weights.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {weights.slice().reverse().slice(0, 7).map((w) => (
                  <div key={w.date} className="flex items-center justify-between" style={{ padding: "5px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12 }}>
                    <div style={{ color: C.muted }}>{fmtShort(w.date)}</div>
                    <div className="flex items-center gap-3">
                      <div style={{ fontWeight: 700 }}>{w.kg.toFixed(1)} kg</div>
                      <button onClick={() => deleteWeight(w.date)} style={{ color: C.muted, padding: 2 }} aria-label="Delete weigh-in"><X size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Target explainer */}
          <Card accent={C.green}>
            <Eyebrow color={C.green}>Why the target moved from 75 kg</Eyebrow>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: C.text }}>
              You carry <b>{BODY.lbm} kg of lean mass</b>. At 75 kg body weight that would put you at <b style={{ color: C.danger }}>{((1 - BODY.lbm / 75) * 100).toFixed(1)}% body fat</b> — not reachable and not safe. To get there at a healthy 12% you'd have to give up about <b>{(BODY.lbm - 75 * 0.88).toFixed(1)} kg of the muscle</b> you've spent a year building.
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: C.text, marginTop: 10 }}>
              <b style={{ color: C.green }}>{BODY.target} kg</b> is your current lean mass at {BODY.targetBf}% body fat (it rose from 82.7 as lean mass went up on the 29 Sep scan): visibly lean, full strength, sustainable year-round. Cross-check it with a waist tape at <b>{BODY.waistTarget}</b> rather than the scale alone — BIA flatters lean mass, so the exact kg may shift.
            </div>
          </Card>

          {/* Scan comparison */}
          <Card>
            <Eyebrow>Evolt scan · {SCAN.prevDate} → {SCAN.date}</Eyebrow>
            {SCAN.rows.map((r) => {
              const delta = r.prev !== null ? Math.round((r.now - r.prev) * 10) / 10 : null;
              let dColor = C.muted;
              if (delta !== null && delta !== 0) {
                if (r.goodDown) dColor = delta < 0 ? C.green : C.amber;
                else if (r.goodUp) dColor = delta > 0 ? C.green : C.amber;
              }
              return (
                <div key={r.label} className="flex items-center justify-between" style={{ padding: "7px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}>
                  <div>{r.label}</div>
                  <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                    {r.prev !== null && <span style={{ color: C.muted, fontSize: 11.5 }}>{r.prev}</span>}
                    <span style={{ fontWeight: 700 }}>{r.now} {r.unit}</span>
                    {delta !== null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: dColor, minWidth: 34, textAlign: "right" }}>
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 12, padding: "10px 12px", background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
              <b>Segments — legs grew, upper body held.</b><br />
              Legs: left {SCAN.segmental[1].prevLeft} → <b>{SCAN.segmental[1].left}</b> kg, right {SCAN.segmental[1].prevRight} → <b>{SCAN.segmental[1].right}</b> kg — both up and now matched.<br />
              Arms: left {SCAN.segmental[0].prevLeft} → <b>{SCAN.segmental[0].left}</b> kg, right {SCAN.segmental[0].prevRight} → <b>{SCAN.segmental[0].right}</b> kg. Torso {SCAN.segmental[2].prev} → {SCAN.segmental[2].now} kg. Flat — inside scan noise, but the right arm is now marginally ahead.<br />
              Evolt still rates you BALANCED left–right.
            </div>
            <div style={{ marginTop: 10, padding: "10px 12px", background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 8, fontSize: 12, lineHeight: 1.5, color: "#E8B79C" }}>
              Treat the <b>+1.1 kg lean gain as optimistic</b> — total body water rose 0.8 kg (52.4 → 53.2), and hydration alone moves apparent lean mass. The fat numbers all moving the same way (fat mass, torso, visceral, waist) is the part to trust.
            </div>
          </Card>

          {/* Evolt audit */}
          <Card>
            <Eyebrow>Is the Evolt calorie number right?</Eyebrow>
            {EVOLT_AUDIT.map((a, i) => {
              const isOpen = openAudit === i;
              const tone = a.tone === "good" ? C.green : a.tone === "bad" ? C.danger : C.amber;
              return (
                <div key={a.item} style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                  <button onClick={() => setOpenAudit(isOpen ? null : i)} className="w-full flex items-center justify-between" style={{ padding: "9px 0" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: "left" }}>{a.item}</div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: tone, letterSpacing: "0.03em" }}>{a.verdict}</span>
                      {isOpen ? <ChevronUp size={14} color={C.muted} /> : <ChevronDown size={14} color={C.muted} />}
                    </div>
                  </button>
                  {isOpen && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, paddingBottom: 10 }}>{a.detail}</div>}
                </div>
              );
            })}
            <div style={{ marginTop: 12, padding: "10px 12px", background: C.amberSoft, border: `1px solid ${C.amber}`, borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
              <b>The rule that matters:</b> a body scanner estimates, the bathroom scale measures. Two weeks of your own trend beats any machine's number. Working maintenance: <b>~{BODY.realTee.toLocaleString()} kcal</b>, not Evolt's 3,027.
            </div>
          </Card>
        </div>
      ) : view === "race" ? (
        <div className="px-5 pt-4 flex flex-col gap-4">
          <Card accent={C.blue}>
            <Eyebrow color={C.blue}>Spartan Sprint · 5 km · ~20 obstacles · October 2026</Eyebrow>
            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              Wednesday is short and sharp, Saturday is longer and steady. Every easy portion is capped at RPE 4–5 — if you can't hold a conversation, you're running too fast for the purpose of the session.
            </div>
          </Card>

          {RUN_PLAN.map((w) => {
            const isCurrent = todayISO() >= w.start && todayISO() <= w.end;
            const accent = w.peak ? C.amber : w.taper ? C.green : isCurrent ? C.blue : C.cardBorder;
            return (
              <Card key={w.wk} accent={accent}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800 }}>
                    Week {w.wk}
                    {isCurrent && <span style={{ marginLeft: 8, fontSize: 9.5, color: C.blue, fontWeight: 800, letterSpacing: "0.04em" }}>THIS WEEK</span>}
                    {w.peak && <span style={{ marginLeft: 8, fontSize: 9.5, color: C.amber, fontWeight: 800 }}>PEAK</span>}
                    {w.taper && <span style={{ marginLeft: 8, fontSize: 9.5, color: C.green, fontWeight: 800 }}>TAPER</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{fmtShort(w.start)} – {fmtShort(w.end)}</div>
                </div>
                <div style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 8 }}>
                  <div style={{ fontSize: 10.5, color: C.blue, fontWeight: 800, letterSpacing: "0.04em" }}>WEDNESDAY</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>{w.wed}</div>
                </div>
                <div style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 10.5, color: C.blue, fontWeight: 800, letterSpacing: "0.04em" }}>SATURDAY</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>{w.sat}</div>
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 8, fontStyle: "italic" }}>{w.goal}</div>
              </Card>
            );
          })}

          <Eyebrow>Obstacle plan — sorted by grip demand</Eyebrow>
          {OBSTACLES.map((group) => {
            const isOpen = openTier === group.tier;
            return (
              <div key={group.tier} style={{ background: C.card, border: `1px solid ${group.color}`, borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setOpenTier(isOpen ? null : group.tier)} className="w-full flex items-center justify-between" style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: group.color, textAlign: "left", letterSpacing: "0.02em" }}>{group.title}</div>
                  {isOpen ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
                </button>
                {isOpen && (
                  <div style={{ padding: "0 16px 14px" }}>
                    {group.items.map((o) => (
                      <div key={o.name} style={{ padding: "9px 0", borderTop: `1px solid ${C.cardBorder}` }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{o.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>{o.how}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Card accent={C.amber}>
            <Eyebrow color={C.amber}>Burpee budget</Eyebrow>
            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              4 heavy-grip obstacles × 30 burpees = <b>120 burpees</b>, on top of 5 km. That's why the Friday burpee ladder isn't optional — train for 150 and race day feels manageable.
              <br /><br />
              Also worth knowing: <b>you can walk the whole course.</b> There's no pace requirement in an open-heat Spartan Sprint. The only real enemy is quitting.
            </div>
          </Card>

          <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 12, padding: "12px 14px", fontSize: 11.5, color: "#E8B79C", lineHeight: 1.5 }}>
            {STOP_RULE}
          </div>
        </div>
      ) : (
        <div className="px-5 pt-4 flex flex-col gap-4">
          {/* Day mode toggle + target */}
          <Card accent={C.amber}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <Eyebrow>Daily target</Eyebrow>
              <div className="flex gap-1.5">
                {[["lift", "Lift / rest"], ["run", "Run day"]].map(([m, lbl]) => (
                  <button key={m} onClick={() => setDayMode(m)} style={{
                    padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700,
                    border: `1px solid ${dayMode === m ? C.amber : C.cardBorder}`,
                    background: dayMode === m ? C.amberSoft : "transparent",
                    color: dayMode === m ? C.amber : C.muted }}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-5">
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{target.kcal.toLocaleString()}</div><div style={{ fontSize: 10.5, color: C.muted }}>kcal</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{target.protein}g</div><div style={{ fontSize: 10.5, color: C.muted }}>protein</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{target.carbs}g</div><div style={{ fontSize: 10.5, color: C.muted }}>carbs</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{target.fat}g</div><div style={{ fontSize: 10.5, color: C.muted }}>fat</div></div>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
              Weekly average ~2,390. Run days are Wed and Sat — the app picks the right one for today automatically, but you can override it. Deficit is ~200–300 kcal against a working maintenance of ~{BODY.realTee.toLocaleString()}, not Evolt's 3,027.
            </div>
          </Card>

          {/* Today's food log */}
          <Card>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <Eyebrow>Today's log</Eyebrow>
              <div style={{ fontSize: 11.5, color: C.amber, fontWeight: 700 }}>{todayTotals.kcal.toLocaleString()} / {target.kcal.toLocaleString()} kcal</div>
            </div>
            <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${Math.min(100, (todayTotals.kcal / target.kcal) * 100)}%`,
                background: todayTotals.kcal > target.kcal ? C.danger : C.amber }} />
            </div>
            <div className="flex gap-5" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: C.muted }}>{todayTotals.protein}g <span style={{ color: C.text }}>P</span> <span style={{ fontSize: 10 }}>/ {target.protein}</span></div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{todayTotals.carbs}g <span style={{ color: C.text }}>C</span> <span style={{ fontSize: 10 }}>/ {target.carbs}</span></div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{todayTotals.fat}g <span style={{ color: C.text }}>F</span> <span style={{ fontSize: 10 }}>/ {target.fat}</span></div>
            </div>

            {logLoaded && todayLog.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {todayLog.map((f, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ padding: "7px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}>
                    <div>
                      <div>{f.name}</div>
                      {f.source && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{f.source}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ color: C.muted, fontSize: 11.5, whiteSpace: "nowrap" }}>{f.kcal} kcal · {f.protein}P {f.carbs}C {f.fat}F</div>
                      <button onClick={() => deleteFoodEntry(i)} style={{ color: C.muted, padding: 4 }} aria-label="Remove food"><X size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!manualMode ? (
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                  Log a food — Claude searches for real nutrition data on chain/branded items {aiAvailable ? "" : "(unavailable here — manual entry only)"}
                </div>
                <div className="flex gap-2">
                  <input value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    placeholder="e.g. 130g grilled chicken breast"
                    style={{ flex: 1, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 13 }} />
                  <button onClick={handleLookup} disabled={lookupLoading || !foodQuery.trim()}
                    style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "9px 14px",
                      opacity: lookupLoading || !foodQuery.trim() ? 0.6 : 1, whiteSpace: "nowrap" }}>
                    {lookupLoading ? "Looking up…" : "Log it"}
                  </button>
                </div>
                <button onClick={() => { setManualMode(true); setManualFood((prev) => ({ ...prev, name: foodQuery })); }}
                  style={{ fontSize: 11.5, color: C.muted, marginTop: 8, textDecoration: "underline" }}>Enter macros manually instead</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Add food manually</div>
                <input value={manualFood.name} onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })} placeholder="Food name"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 13, marginBottom: 8 }} />
                <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 10 }}>
                  {["kcal", "protein", "carbs", "fat"].map((field) => (
                    <input key={field} inputMode="numeric" value={manualFood[field]}
                      onChange={(e) => setManualFood({ ...manualFood, [field]: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder={field}
                      style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "8px 6px", color: C.text, fontSize: 12, textAlign: "center", width: "100%" }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleManualAdd} style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>Add</button>
                  <button onClick={() => { setManualMode(false); setLookupError(""); }}
                    style={{ border: `1px solid ${C.cardBorder}`, color: C.muted, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>Cancel</button>
                </div>
              </div>
            )}

            {lookupError && <div style={{ fontSize: 11.5, color: C.danger, marginTop: 8 }}>{lookupError}</div>}
            {archiveFoodMsg && (
              <div style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8, padding: "8px 10px", fontSize: 11.5, color: "#B7E0C6", marginTop: 10 }}>{archiveFoodMsg}</div>
            )}

            <div className="mt-4" style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 12 }}>
              {!confirmingFoodReset ? (
                <button onClick={() => setConfirmingFoodReset(true)} disabled={todayLog.length === 0} className="flex items-center gap-2"
                  style={{ fontSize: 12.5, fontWeight: 700, color: todayLog.length === 0 ? C.muted : C.amber, opacity: todayLog.length === 0 ? 0.5 : 1 }}>
                  <Archive size={14} /> Archive day &amp; reset
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: C.text, marginBottom: 8 }}>This saves today's log permanently to history, then clears it so you can start fresh. Continue?</div>
                  <div className="flex gap-2">
                    <button onClick={archiveTodayAndReset} disabled={archivingFood} style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>
                      {archivingFood ? "Archiving…" : "Confirm"}
                    </button>
                    <button onClick={() => setConfirmingFoodReset(false)} style={{ border: `1px solid ${C.cardBorder}`, color: C.muted, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Food log history */}
          <Card>
            <Eyebrow>Food log history</Eyebrow>
            {foodHistory.filter((d) => d.archived || d.date !== todayISO()).length === 0 && (
              <div style={{ fontSize: 12.5, color: C.muted }}>Past days you've logged food will show up here.</div>
            )}
            <div className="flex flex-col gap-2">
              {foodHistory.filter((d) => d.archived || d.date !== todayISO()).map((d) => {
                const isOpen = expandedLogDate === d.key;
                const items = logDateDetail[d.key];
                const overTarget = d.kcal > NUTRITION.runTarget.kcal;
                return (
                  <div key={d.key} style={{ border: `1px solid ${d.archived ? C.amber : C.cardBorder}`, borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => loadLogDateDetail(d.key)} className="w-full flex items-center justify-between" style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {fmtShort(d.date)}
                        {d.archived && d.date === todayISO() && <span style={{ marginLeft: 6, fontSize: 10, color: C.amber, fontWeight: 800 }}>ARCHIVED</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div style={{ fontSize: 11.5, color: overTarget ? C.danger : C.muted }}>{d.kcal.toLocaleString()} kcal · {d.protein}P {d.carbs}C {d.fat}F</div>
                        {isOpen ? <ChevronUp size={14} color={C.muted} /> : <ChevronDown size={14} color={C.muted} />}
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 12px 12px" }}>
                        {(items || []).map((f, i) => (
                          <div key={i} className="flex items-center justify-between" style={{ padding: "5px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12 }}>
                            <div>
                              <div>{f.name}</div>
                              {f.source && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{f.source}</div>}
                            </div>
                            <div style={{ color: C.muted, fontSize: 11 }}>{f.kcal} kcal · {f.protein}P {f.carbs}C {f.fat}F</div>
                          </div>
                        ))}
                        <button onClick={() => deleteLogDate(d.key)} className="flex items-center gap-1.5 mt-2" style={{ color: C.danger, fontSize: 11.5, fontWeight: 700 }}>
                          <X size={12} /> Delete this day
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Reference meal plan */}
          <Eyebrow>Reference meal plan · {dayMode === "run" ? "RUN DAY" : "LIFT / REST DAY"}</Eyebrow>
          {NUTRITION.meals.map((meal) => {
            const totals = mealTotals(meal, dayMode);
            return (
              <Card key={meal.name}>
                <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{meal.name}</div>
                  <div style={{ fontSize: 11.5, color: C.amber, fontWeight: 700 }}>{meal.time}</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.45 }}>{meal.note}</div>
                {meal.foods.map((f) => {
                  const v = dayMode === "lift" && f.lift ? f.lift : f;
                  const swapped = dayMode === "lift" && f.lift;
                  return (
                    <div key={f.name} className="flex items-center justify-between" style={{ padding: "6px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}>
                      <div>
                        <span>{f.name}</span>
                        <span style={{ color: swapped ? C.green : C.muted }}> · {v.amount}</span>
                        {swapped && <span style={{ color: C.muted, fontSize: 10, marginLeft: 4 }}>(was {f.amount})</span>}
                      </div>
                      <div style={{ color: C.muted, fontSize: 11.5, whiteSpace: "nowrap", marginLeft: 8 }}>{v.kcal} kcal</div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between" style={{ paddingTop: 8, marginTop: 4, borderTop: `1px solid ${C.amber}` }}>
                  <button onClick={() => addMealToLog(meal)} style={{ fontSize: 11.5, fontWeight: 800, color: C.amber, display: "flex", alignItems: "center", gap: 4 }}>
                    <Plus size={12} /> Log this meal
                  </button>
                  <div style={{ fontSize: 11.5, color: C.text }}>{totals.kcal} kcal · {totals.protein}P · {totals.carbs}C · {totals.fat}F</div>
                </div>
              </Card>
            );
          })}

          {/* Carb swaps */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
            <button onClick={() => setShowSwaps(!showSwaps)} className="w-full flex items-center justify-between" style={{ padding: "13px 16px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: "left" }}>Carb swaps — all ≈200–210 kcal</div>
              {showSwaps ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
            </button>
            {showSwaps && (
              <div style={{ padding: "0 16px 14px" }}>
                <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, paddingBottom: 8 }}>
                  Swap any carb portion in the plan for any of these. Match the <b>calories</b>, not the grams. Protein and fat sources stay as written.
                </div>
                {CARB_SWAPS.map((s) => (
                  <div key={s.name} className="flex items-center justify-between" style={{ padding: "6px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}>
                    <div><span>{s.name}</span><span style={{ color: C.muted }}> · {s.amount}</span></div>
                    <div style={{ color: C.muted, fontSize: 11.5, whiteSpace: "nowrap", marginLeft: 8 }}>{s.kcal} kcal · {s.carbs}C</div>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: "9px 11px", background: C.amberSoft, border: `1px solid ${C.amber}`, borderRadius: 8, fontSize: 11.5, lineHeight: 1.45 }}>
                  Oats, pandesal and pasta bring extra fat with them — if you use more than one in a day, drop the Meal 3 almonds.
                </div>
              </div>
            )}
          </div>

          <Card>
            <Eyebrow>Key rules</Eyebrow>
            {[
              ["Protein floor", "Never below 190g. You're running ~205g (2.3 g/kg) since the move to 130g chicken servings — comfortably in the useful range."],
              ["Hydration", "3L daily, more on run days. Add electrolytes on Wed and Sat once you're running in heat."],
              ["Weekly check", "Weigh daily, act on the 7-day average only. Flat two weeks → −150 kcal. Faster than 0.6 kg/week → +150 kcal."],
              ["Re-scan", "Evolt every 6–8 weeks; next mid-October. Compare scans to each other, never trust one in isolation."],
              ["Race week", "No deficit. Eat at maintenance (~2,600) and raise carbs. Turn up rested and fuelled."],
              ["Meal prep", "Batch-cook rice, chicken and eggs on Sunday. With rice cakes gone, rice is the carb in three of five meals — cook it in one go."],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "8px 0", borderTop: `1px solid ${C.cardBorder}` }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
