import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Dumbbell,
  Check,
  X,
  Calendar,
  Archive,
  Utensils,
} from "lucide-react";

// ---- Palette ----
const C = {
  bg: "#12151A",
  card: "#1B1F26",
  cardBorder: "#2A2F38",
  amber: "#C98A3C",
  amberSoft: "#4A3A24",
  green: "#5CA37A",
  greenSoft: "#1D3A2B",
  text: "#EDEAE3",
  muted: "#8B93A1",
  danger: "#C9603C",
};

const NUTRITION = {
  target: { kcal: 2250, protein: 195, carbs: 210, fat: 60 },
  meals: [
    {
      name: "Meal 1 — Pre/Post Workout",
      time: "9:30–11:00 AM",
      note: "Biggest carb meal. Fuel your workout and recovery.",
      foods: [
        { name: "Whey Protein (ON)", amount: "30g / 1 scoop", kcal: 120, protein: 24, carbs: 3, fat: 1 },
        { name: "Rolled Oats", amount: "70g", kcal: 263, protein: 9, carbs: 46, fat: 5 },
        { name: "Banana", amount: "1 medium", kcal: 105, protein: 1, carbs: 27, fat: 0 },
      ],
    },
    {
      name: "Meal 2 — Lean Beef + Rice",
      time: "1:00–2:00 PM",
      note: "Post-workout refuel. Higher carbs now that budget allows it.",
      foods: [
        { name: "Lean Ground Beef (90%)", amount: "120g", kcal: 248, protein: 30, carbs: 0, fat: 12 },
        { name: "Broccoli", amount: "100g", kcal: 35, protein: 3, carbs: 7, fat: 0 },
        { name: "Cooked White Rice", amount: "140g", kcal: 182, protein: 4, carbs: 39, fat: 0 },
        { name: "Boiled Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
      ],
    },
    {
      name: "Meal 3 — Afternoon Snack",
      time: "4:30–5:00 PM",
      note: "Peanut butter removed — rice cake count (Daddy D brand) bumped up to cover the calories instead.",
      foods: [
        { name: "Whole Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Rice Cakes (Daddy D)", amount: "5 pcs", kcal: 175, protein: 3, carbs: 35, fat: 0 },
      ],
    },
    {
      name: "Meal 4 — Eggs + Light Carb",
      time: "7:00–7:30 PM",
      note: "Small carb bump kept — avoids zero-carb-at-night restriction.",
      foods: [
        { name: "Whole Eggs", amount: "2 pcs", kcal: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Egg Whites", amount: "4 pcs", kcal: 68, protein: 16, carbs: 0, fat: 0 },
        { name: "Rolled Oats", amount: "30g", kcal: 113, protein: 4, carbs: 20, fat: 2 },
      ],
    },
    {
      name: "Meal 5 — Chicken + Veg + Rice",
      time: "10:30–11:00 PM",
      note: "Late meal for your longer day — still light this close to sleep.",
      foods: [
        { name: "Chicken Breast", amount: "180g", kcal: 297, protein: 56, carbs: 0, fat: 6 },
        { name: "Broccoli", amount: "150g", kcal: 53, protein: 5, carbs: 11, fat: 0 },
        { name: "Boiled Egg", amount: "1 pc", kcal: 70, protein: 6, carbs: 1, fat: 5 },
        { name: "Cooked White Rice", amount: "60g", kcal: 78, protein: 2, carbs: 17, fat: 0 },
      ],
    },
  ],
};

const DAYS = {
  UpperA: {
    short: "Upper A",
    label: "Upper A — Push emphasis (~52 min)",
    exercises: [
      { name: "Incline Press Machine", target: "4×6–8", rest: "2 min", execution: "Left dumbbell first — drop the weight if left can't match right.", key: true },
      { name: "Lat Pulldown", target: "3×8–10", rest: "90 sec", execution: "Lighter pull volume today — the heavy pull day is Upper B. Straps on left hand." },
      { name: "Machine Shoulder Press", target: "3×8–10", rest: "90 sec", execution: "Full ROM — machine removes grip instability." },
      { name: "Cable Lateral Raise", target: "3×12–15", rest: "60 sec (after pair)", execution: "Superset with Rope Tricep Pushdown. Lead with elbow, not wrist." },
      { name: "Rope Tricep Pushdown", target: "3×12–15", rest: "60 sec (after pair)", execution: "Superset with Cable Lateral Raise. Rope is easier on left wrist than a bar." },
      { name: "DB Curl (alternating)", target: "2×10–12", rest: "60 sec", execution: "Left arm first — light enough for your grip." },
      { name: "Hanging Leg Raise", target: "3×10–12", rest: "60 sec", execution: "Swapped in from Lower A per your request — control the eccentric, no swinging.", isNew: true },
    ],
  },
  LowerA: {
    short: "Lower A",
    label: "Lower A — Quad emphasis (~55 min)",
    exercises: [
      { name: "Smith Machine Squat", target: "4×4–6", rest: "2 min", execution: "Increase weight once you hit 6 reps on every set.", key: true },
      { name: "Leg Press", target: "3×8–10", rest: "75 sec", execution: "Feet shoulder-width. Watch left knee tracking." },
      { name: "Leg Extension", target: "3×12–15", rest: "60 sec", execution: "Single-leg optional — great left-right balance check." },
      { name: "Standing Calf Raise", target: "3×12–15", rest: "45 sec", execution: "Slow eccentric — 3 sec down." },
      { name: "Single-Leg Stand (left leg)", target: "2×30 sec", rest: "30 sec", execution: "Near a wall for safety. Vestibular + ankle stability." },
      { name: "Hanging Leg Raise", target: "3×10–12", rest: "60 sec", execution: "Control the eccentric — no swinging.", isNew: true },
    ],
  },
  UpperB: {
    short: "Upper B",
    label: "Upper B — Pull emphasis (~52 min)",
    exercises: [
      { name: "Lat Pulldown", target: "4×6–8", rest: "2 min", execution: "KEY LIFT today — go heavier than Upper A. Straps on left hand, wide grip.", key: true },
      { name: "Flat Machine Chest Press", target: "3×10–12", rest: "90 sec", execution: "Lighter press volume today — the heavy press day is Upper A. 2 sec down, 1 sec up." },
      { name: "Machine High Row", target: "3×8–10", rest: "90 sec", execution: "Retract scapula first, then pull. Feel lats, not just arms." },
      { name: "Pec Deck / Cable Fly", target: "3×12–15", rest: "60 sec (after pair)", execution: "Superset with Rear Delt Fly. Squeeze at peak contraction." },
      { name: "Rear Delt Fly Machine", target: "3×12–15", rest: "60 sec (after pair)", execution: "Superset with Pec Deck. Machine removes grip demand." },
      { name: "Hammer Curl", target: "2×10–12", rest: "60 sec", execution: "Neutral grip is easier on left wrist." },
      { name: "Suitcase Carry (right hand)", target: "3×20–30 sec", rest: "45 sec", execution: "Swapped for Side Plank — trains left obliques without weight-bearing through your left arm. Hold DB in right hand, resist leaning.", isNew: true },
    ],
  },
  LowerB: {
    short: "Lower B",
    label: "Lower B — Hinge emphasis (~50 min)",
    exercises: [
      { name: "Romanian Deadlift (Smith)", target: "4×6–8", rest: "2 min", execution: "KEY LIFT today. Hinge, don't squat — Smith bar removes grip demand.", key: true },
      { name: "Rack Pull (below knee)", target: "3×5–6", rest: "2–3 min", execution: "Shortened ROM removes grip stress. Straps mandatory on left side." },
      { name: "Hip Thrust Machine", target: "3×10–12", rest: "90 sec", execution: "Full hip extension — squeeze glutes at the top." },
      { name: "Seated Leg Curl", target: "3×10–12", rest: "60 sec", execution: "Squeeze both legs equally at peak contraction." },
      { name: "Pallof Press", target: "3×10/side", rest: "60 sec", execution: "Anti-rotation core — key for stroke rehab and golf rotation." },
      { name: "Hip Abductor Machine (optional)", target: "2×12–15", rest: "45 sec", execution: "Only if time allows — cut this first if you're short on time." },
    ],
  },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptySetRow() {
  return { reps: "", weight: "" };
}

// ---- Week helpers (Monday-start weeks) ----
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

export default function LiftLog() {
  const [view, setView] = useState("log"); // 'log' | 'history' | 'week' | 'nutrition'
  const [day, setDay] = useState("UpperA");
  const [entries, setEntries] = useState({});
  const [openEx, setOpenEx] = useState(() => new Set(DAYS.UpperA.exercises.map((e) => e.name)));
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

  const exportBackup = async () => {
    setError("");
    try {
      const listRes = await window.storage.list("", false);
      const keys = listRes ? listRes.keys : [];
      const data = {};
      for (const k of keys) {
        try {
          const res = await window.storage.get(k, false);
          data[k] = res.value;
        } catch (e) {
          // skip unreadable key
        }
      }
      const payload = { exportedAt: new Date().toISOString(), data };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lift-log-backup-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Couldn't create a backup file. Try again.");
    }
  };

  const importBackup = async (file) => {
    setRestoring(true);
    setError("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed && parsed.data ? parsed.data : parsed;
      const entriesToWrite = Object.entries(data || {});
      if (entriesToWrite.length === 0) throw new Error("empty backup");
      for (const [k, v] of entriesToWrite) {
        await window.storage.set(k, v, false);
      }
      await loadAll();
      setArchiveMsg("Backup restored successfully.");
      setTimeout(() => setArchiveMsg(""), 4000);
    } catch (e) {
      setError("Couldn't restore that file — make sure it's a Lift Log backup.");
    } finally {
      setRestoring(false);
    }
  };

  const [draftReady, setDraftReady] = useState(false);
  const draftSaveTimer = useRef(null);

  // Load any in-progress draft for this day (survives the app being closed),
  // falling back to empty rows if nothing was saved yet.
  useEffect(() => {
    let cancelled = false;
    setDraftReady(false);
    (async () => {
      let initial = {};
      DAYS[day].exercises.forEach((e) => {
        initial[e.name] = [emptySetRow()];
      });
      try {
        const res = await window.storage.get(`draft:${day}`, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          DAYS[day].exercises.forEach((e) => {
            if (!parsed[e.name]) parsed[e.name] = [emptySetRow()];
          });
          initial = parsed;
        }
      } catch (e) {
        // no draft saved yet for this day — use the empty defaults
      }
      if (!cancelled) {
        setEntries(initial);
        setOpenEx(new Set(DAYS[day].exercises.map((e) => e.name)));
        setSaved(false);
        setDraftReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [day]);

  // Auto-save in-progress entries as a draft (debounced) so nothing is lost
  // if the app is closed before you hit "Save workout".
  useEffect(() => {
    if (!draftReady) return;
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => {
      window.storage.set(`draft:${day}`, JSON.stringify(entries), false).catch(() => {});
    }, 400);
    return () => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [entries, day, draftReady]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const idxRes = await window.storage.get("sessions-index", false).catch(() => null);
      const idx = idxRes ? JSON.parse(idxRes.value) : [];
      setSessions(idx);
      const lvRes = await window.storage.get("last-values", false).catch(() => null);
      setLastValues(lvRes ? JSON.parse(lvRes.value) : {});
      const waRes = await window.storage.get("weekly-archive-index", false).catch(() => null);
      setWeeklyArchive(waRes ? JSON.parse(waRes.value) : []);
    } catch (e) {
      setError("Couldn't load saved data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadFoodLog = useCallback(async () => {
    try {
      const res = await window.storage.get(`foodlog:${todayISO()}`, false).catch(() => null);
      setTodayLog(res ? JSON.parse(res.value) : []);
      const idxRes = await window.storage.get("foodlog-index", false).catch(() => null);
      setFoodHistory(idxRes ? JSON.parse(idxRes.value) : []);
    } catch (e) {
      setTodayLog([]);
    } finally {
      setLogLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFoodLog();
  }, [loadFoodLog]);

  const saveFoodLog = async (updated) => {
    setTodayLog(updated);
    const date = todayISO();
    const key = date; // the live/in-progress entry for today always uses the date as its key
    await window.storage.set(`foodlog:${key}`, JSON.stringify(updated), false).catch(() => {});

    const totals = updated.reduce(
      (acc, f) => ({
        kcal: acc.kcal + f.kcal,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const newIndex = [
      { key, date, ...totals, items: updated.length, archived: false },
      ...foodHistory.filter((d) => d.key !== key),
    ]
      .sort((a, b) => (b.date + (b.archived ? "z" : "a")).localeCompare(a.date + (a.archived ? "z" : "a")))
      .slice(0, 150);
    setFoodHistory(newIndex);
    await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});
    setLogDateDetail((prev) => ({ ...prev, [key]: updated }));
  };

  const addFoodEntry = async (entry) => {
    const clean = {
      name: entry.name || "Food",
      kcal: Math.round(Number(entry.kcal) || 0),
      protein: Math.round(Number(entry.protein) || 0),
      carbs: Math.round(Number(entry.carbs) || 0),
      fat: Math.round(Number(entry.fat) || 0),
      source: entry.source || "manual entry",
      loggedAt: new Date().toISOString(),
    };
    await saveFoodLog([...todayLog, clean]);
  };

  const deleteFoodEntry = async (idx) => {
    await saveFoodLog(todayLog.filter((_, i) => i !== idx));
  };

  const loadLogDateDetail = async (key) => {
    if (logDateDetail[key]) {
      setExpandedLogDate(expandedLogDate === key ? null : key);
      return;
    }
    try {
      const res = await window.storage.get(`foodlog:${key}`, false);
      const items = res ? JSON.parse(res.value) : [];
      setLogDateDetail((prev) => ({ ...prev, [key]: items }));
      setExpandedLogDate(key);
    } catch (e) {
      setLogDateDetail((prev) => ({ ...prev, [key]: [] }));
      setExpandedLogDate(key);
    }
  };

  const deleteLogDate = async (key) => {
    try {
      await window.storage.delete(`foodlog:${key}`, false).catch(() => {});
      const newIndex = foodHistory.filter((d) => d.key !== key);
      setFoodHistory(newIndex);
      await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});
      if (expandedLogDate === key) setExpandedLogDate(null);
    } catch (e) {
      // non-fatal
    }
  };

  const archiveTodayAndReset = async () => {
    if (todayLog.length === 0) return;
    setArchivingFood(true);
    const date = todayISO();
    const archiveKey = `archive:${date}:${Date.now()}`;
    const snapshot = todayLog;
    const totals = todayTotals;
    try {
      const saved = await window.storage.set(`foodlog:${archiveKey}`, JSON.stringify(snapshot), false);
      if (!saved) throw new Error("archive save failed");

      const archivedEntry = {
        key: archiveKey,
        date,
        kcal: totals.kcal,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        items: snapshot.length,
        archived: true,
      };
      const liveKey = date;
      const liveEntry = { key: liveKey, date, kcal: 0, protein: 0, carbs: 0, fat: 0, items: 0, archived: false };

      await window.storage.set(`foodlog:${liveKey}`, JSON.stringify([]), false).catch(() => {});

      const newIndex = [
        archivedEntry,
        liveEntry,
        ...foodHistory.filter((d) => d.key !== archiveKey && d.key !== liveKey),
      ]
        .sort((a, b) => (b.date + (b.archived ? "z" : "a")).localeCompare(a.date + (a.archived ? "z" : "a")))
        .slice(0, 150);
      await window.storage.set("foodlog-index", JSON.stringify(newIndex), false).catch(() => {});

      setFoodHistory(newIndex);
      setTodayLog([]);
      setLogDateDetail((prev) => ({ ...prev, [archiveKey]: snapshot, [liveKey]: [] }));
      setConfirmingFoodReset(false);
      setArchiveFoodMsg(`Today's log archived (${totals.kcal.toLocaleString()} kcal) and reset.`);
      setTimeout(() => setArchiveFoodMsg(""), 4000);
    } catch (e) {
      setLookupError("Couldn't archive today's log. Try again.");
    } finally {
      setArchivingFood(false);
    }
  };


  const handleLookup = async () => {
    const query = foodQuery.trim();
    if (!query) return;
    setLookupLoading(true);
    setLookupError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [
            {
              role: "user",
              content: `Log nutrition for: "${query}".

If this is a specific chain restaurant item, branded packaged food, or anything with an official published nutrition label, SEARCH THE WEB for the real figures first — don't estimate from memory. Pay close attention to exact variant (e.g. patty size, "no mayo", added extras) and add/subtract components precisely rather than guessing a round number. For plain home-cooked or generic foods without a brand, standard USDA-style estimates are fine without searching.

After you have the real numbers, respond with ONLY a raw JSON object as your final message, no markdown fences, no explanation before or after it:
{"name": "short food name", "kcal": number, "protein": number, "carbs": number, "fat": number, "source": "short source note, e.g. 'Burger King official nutrition' or 'estimated - generic food'"}`,
            },
          ],
        }),
      });
      if (!response.ok) throw new Error("api unavailable");
      const data = await response.json();
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
      await addFoodEntry(parsed);
      setFoodQuery("");
      setAiAvailable(true);
    } catch (e) {
      // AI lookup isn't reachable outside the Claude chat environment —
      // fall back to manual entry instead of failing silently.
      setAiAvailable(false);
      setManualMode(true);
      setManualFood((prev) => ({ ...prev, name: query }));
      setLookupError("AI lookup isn't available here — enter the macros manually below.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualFood.name.trim()) {
      setLookupError("Give the food a name first.");
      return;
    }
    await addFoodEntry(manualFood);
    setManualFood({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
    setManualMode(false);
    setLookupError("");
    setFoodQuery("");
  };

  const todayTotals = todayLog.reduce(
    (acc, f) => ({
      kcal: acc.kcal + f.kcal,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const currentWeekMonday = mondayOf(todayISO());
  const currentWeekSunday = sundayOf(currentWeekMonday);
  const currentWeekSessions = sessions.filter((s) => mondayOf(s.date) === currentWeekMonday);

  // fetch detail for any current-week sessions we haven't cached, when Week tab is open
  useEffect(() => {
    if (view !== "week") return;
    const missing = currentWeekSessions.filter((s) => !sessionDetail[s.key]);
    if (missing.length === 0) return;
    (async () => {
      const updates = {};
      for (const s of missing) {
        try {
          const res = await window.storage.get(s.key, false);
          updates[s.key] = res ? JSON.parse(res.value) : null;
        } catch (e) {
          updates[s.key] = null;
        }
      }
      setSessionDetail((prev) => ({ ...prev, ...updates }));
    })();
  }, [view, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOpen = (name) => {
    setOpenEx((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const updateSet = (exName, idx, field, value) => {
    setEntries((prev) => {
      const rows = [...prev[exName]];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, [exName]: rows };
    });
  };

  const addSet = (exName) => {
    setEntries((prev) => ({ ...prev, [exName]: [...prev[exName], emptySetRow()] }));
  };

  const removeSet = (exName, idx) => {
    setEntries((prev) => {
      const rows = prev[exName].filter((_, i) => i !== idx);
      return { ...prev, [exName]: rows.length ? rows : [emptySetRow()] };
    });
  };

  const totalVolume = Object.values(entries).reduce((sum, rows) => {
    return (
      sum +
      rows.reduce((s, r) => {
        const reps = parseFloat(r.reps) || 0;
        const weight = parseFloat(r.weight) || 0;
        return s + reps * weight;
      }, 0)
    );
  }, 0);

  const loggedSetCount = Object.values(entries).reduce(
    (n, rows) => n + rows.filter((r) => r.reps !== "" || r.weight !== "").length,
    0
  );

  const saveWorkout = async () => {
    setSaving(true);
    setError("");
    try {
      const cleanEntries = {};
      let setCount = 0;
      Object.entries(entries).forEach(([name, rows]) => {
        const filled = rows.filter((r) => r.reps !== "" || r.weight !== "");
        if (filled.length) {
          cleanEntries[name] = filled;
          setCount += filled.length;
        }
      });
      if (Object.keys(cleanEntries).length === 0) {
        setError("Log at least one set before saving.");
        setSaving(false);
        return;
      }
      const key = `session:${Date.now()}`;
      const record = {
        key,
        date: todayISO(),
        day,
        entries: cleanEntries,
        totalVolume,
        totalSets: setCount,
      };
      const res = await window.storage.set(key, JSON.stringify(record), false);
      if (!res) throw new Error("save failed");

      const newIndex = [
        { key, date: record.date, day, totalVolume, totalSets: setCount },
        ...sessions,
      ].slice(0, 500);
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

      // Workout is safely saved — clear today's draft and reset the form.
      await window.storage.delete(`draft:${day}`, false).catch(() => {});
      const freshEntries = {};
      DAYS[day].exercises.forEach((e) => {
        freshEntries[e.name] = [emptySetRow()];
      });
      setEntries(freshEntries);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const loadSessionDetail = async (key) => {
    if (sessionDetail[key]) {
      setExpandedSession(expandedSession === key ? null : key);
      return;
    }
    try {
      const res = await window.storage.get(key, false);
      const data = res ? JSON.parse(res.value) : null;
      setSessionDetail((prev) => ({ ...prev, [key]: data }));
      setExpandedSession(key);
    } catch (e) {
      setError("Couldn't load that session.");
    }
  };

  const deleteSession = async (key) => {
    try {
      await window.storage.delete(key, false);
      const newIndex = sessions.filter((s) => s.key !== key);
      await window.storage.set("sessions-index", JSON.stringify(newIndex), false);
      setSessions(newIndex);
      if (expandedSession === key) setExpandedSession(null);
    } catch (e) {
      setError("Couldn't delete that session.");
    }
  };

  // ---- Weekly aggregation for the current week ----
  const weekAgg = { totalVolume: 0, totalSets: 0, sessionsCount: currentWeekSessions.length, perExercise: {} };
  currentWeekSessions.forEach((s) => {
    const detail = sessionDetail[s.key];
    weekAgg.totalVolume += s.totalVolume || 0;
    weekAgg.totalSets += s.totalSets || 0;
    if (detail) {
      Object.entries(detail.entries).forEach(([name, rows]) => {
        if (!weekAgg.perExercise[name]) weekAgg.perExercise[name] = { volume: 0, sets: 0, bestWeight: 0 };
        rows.forEach((r) => {
          const reps = parseFloat(r.reps) || 0;
          const weight = parseFloat(r.weight) || 0;
          weekAgg.perExercise[name].volume += reps * weight;
          weekAgg.perExercise[name].sets += 1;
          if (weight > weekAgg.perExercise[name].bestWeight) weekAgg.perExercise[name].bestWeight = weight;
        });
      });
    }
  });

  const archiveAndResetWeek = async () => {
    setArchiving(true);
    setError("");
    const weekSessionKeys = currentWeekSessions.map((s) => s.key);
    try {
      const summary = {
        weekKey: currentWeekMonday,
        startDate: currentWeekMonday,
        endDate: currentWeekSunday,
        totalVolume: weekAgg.totalVolume,
        totalSets: weekAgg.totalSets,
        sessionsCount: weekAgg.sessionsCount,
        perExercise: weekAgg.perExercise,
        archivedAt: new Date().toISOString(),
      };
      const summarySaved = await window.storage.set(`weekly-archive:${currentWeekMonday}`, JSON.stringify(summary), false);
      if (!summarySaved) throw new Error("summary save failed");

      const newArchiveIndex = [
        {
          weekKey: currentWeekMonday,
          startDate: currentWeekMonday,
          endDate: currentWeekSunday,
          totalVolume: weekAgg.totalVolume,
          totalSets: weekAgg.totalSets,
          sessionsCount: weekAgg.sessionsCount,
        },
        ...weeklyArchive.filter((w) => w.weekKey !== currentWeekMonday),
      ].slice(0, 100);
      const archiveIdxSaved = await window.storage.set("weekly-archive-index", JSON.stringify(newArchiveIndex), false);
      if (!archiveIdxSaved) throw new Error("archive index save failed");
      setWeeklyArchive(newArchiveIndex);
    } catch (e) {
      setError("Couldn't save this week's summary — reset was not performed, nothing was lost. Try again.");
      setArchiving(false);
      return;
    }

    // Summary is safely saved at this point. Now reset — tolerate individual
    // delete failures so one bad key can't block the rest of the reset.
    for (const key of weekSessionKeys) {
      try {
        await window.storage.delete(key, false);
      } catch (e) {
        // continue; key is removed from the index below regardless
      }
    }

    try {
      const remainingIndex = sessions.filter((s) => !weekSessionKeys.includes(s.key));
      const idxSaved = await window.storage.set("sessions-index", JSON.stringify(remainingIndex), false);
      if (!idxSaved) throw new Error("index update failed");
      setSessions(remainingIndex);
      setSessionDetail((prev) => {
        const next = { ...prev };
        weekSessionKeys.forEach((k) => delete next[k]);
        return next;
      });
      // reload from storage to guarantee the UI matches what's actually persisted
      await loadAll();

      setConfirmingReset(false);
      setArchiveMsg(`Week of ${fmtShort(currentWeekMonday)} archived and reset.`);
      setTimeout(() => setArchiveMsg(""), 4000);
    } catch (e) {
      setError("Summary was saved, but resetting this week's log didn't fully complete. Try archiving again.");
    } finally {
      setArchiving(false);
    }
  };

  const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setView(id)}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        padding: "7px 2px",
        borderRadius: 10,
        fontSize: 10.5,
        fontWeight: 700,
        border: `1px solid ${view === id ? C.amber : C.cardBorder}`,
        background: view === id ? C.amberSoft : "transparent",
        color: view === id ? C.amber : C.muted,
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: fontStack,
        minHeight: "100%",
        paddingBottom: view === "log" ? 96 : 24,
      }}
      className="w-full"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-3" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Lift Log</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 12 }}>
          {view === "log"
            ? "Log today's sets"
            : view === "history"
            ? "Session history"
            : view === "nutrition"
            ? "Daily meal plan"
            : "Weekly summary"}
        </div>
        <div className="flex gap-1.5">
          <TabButton id="log" icon={Dumbbell} label="Log" />
          <TabButton id="week" icon={Calendar} label="Week" />
          <TabButton id="history" icon={History} label="History" />
          <TabButton id="nutrition" icon={Utensils} label="Nutrition" />
        </div>
      </div>

      {error && (
        <div
          className="mx-5 mt-3 px-3 py-2"
          style={{ background: "#2A1D18", border: `1px solid ${C.danger}`, borderRadius: 8, fontSize: 12.5, color: "#E8B79C" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-10 text-center" style={{ color: C.muted, fontSize: 13 }}>
          Loading your data…
        </div>
      ) : view === "log" ? (
        <>
          <div className="flex gap-1.5 px-5 pt-4">
            {Object.keys(DAYS).map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                style={{
                  flex: 1,
                  padding: "9px 2px",
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: `1px solid ${day === d ? C.amber : C.cardBorder}`,
                  background: day === d ? C.amberSoft : "transparent",
                  color: day === d ? C.amber : C.muted,
                }}
              >
                {DAYS[d].short}
              </button>
            ))}
          </div>
          <div className="px-5 pt-1 pb-2" style={{ fontSize: 12, color: C.muted }}>
            {DAYS[day].label}
          </div>

          <div className="px-5 flex flex-col gap-3 mt-2">
            {DAYS[day].exercises.map((ex) => {
              const rows = entries[ex.name] || [];
              const isOpen = openEx.has(ex.name);
              const last = lastValues[ex.name];
              return (
                <div
                  key={ex.name}
                  style={{
                    background: C.card,
                    border: `1px solid ${ex.key ? C.amber : C.cardBorder}`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggleOpen(ex.name)}
                    className="w-full flex items-center justify-between px-4 py-3"
                    style={{ background: "transparent" }}
                  >
                    <div className="text-left">
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                        {ex.name}
                        {ex.key && (
                          <span style={{ marginLeft: 8, fontSize: 10, color: C.amber, fontWeight: 800, letterSpacing: "0.04em" }}>
                            KEY LIFT
                          </span>
                        )}
                        {ex.isNew && (
                          <span style={{ marginLeft: 8, fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: "0.04em" }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        target {ex.target}
                        {ex.rest && <span>{"  ·  rest "}{ex.rest}</span>}
                        {last && (
                          <span>
                            {"  ·  last: "}
                            {last.reps || "–"} reps @ {last.weight || "–"}kg
                          </span>
                        )}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4">
                      {ex.execution && (
                        <div
                          style={{
                            fontSize: 12,
                            color: C.text,
                            background: C.bg,
                            borderLeft: `3px solid ${C.amber}`,
                            borderRadius: 6,
                            padding: "8px 10px",
                            marginBottom: 12,
                            lineHeight: 1.4,
                          }}
                        >
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
                          <div className="col-span-1" style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>
                            {i + 1}
                          </div>
                          <input
                            className="col-span-4"
                            inputMode="numeric"
                            placeholder="0"
                            value={row.reps}
                            onChange={(e) => updateSet(ex.name, i, "reps", e.target.value.replace(/[^0-9]/g, ""))}
                            style={{
                              background: C.bg,
                              border: `1px solid ${C.cardBorder}`,
                              borderRadius: 8,
                              padding: "8px 10px",
                              color: C.text,
                              fontSize: 14,
                              width: "100%",
                            }}
                          />
                          <input
                            className="col-span-4"
                            inputMode="decimal"
                            placeholder="0"
                            value={row.weight}
                            onChange={(e) => updateSet(ex.name, i, "weight", e.target.value.replace(/[^0-9.]/g, ""))}
                            style={{
                              background: C.bg,
                              border: `1px solid ${C.cardBorder}`,
                              borderRadius: 8,
                              padding: "8px 10px",
                              color: C.text,
                              fontSize: 14,
                              width: "100%",
                            }}
                          />
                          <div className="col-span-3 flex justify-end">
                            <button
                              onClick={() => removeSet(ex.name, i)}
                              style={{ color: C.muted, padding: 6 }}
                              aria-label="Remove set"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addSet(ex.name)}
                        className="flex items-center gap-1.5 mt-1"
                        style={{ color: C.amber, fontSize: 12.5, fontWeight: 700 }}
                      >
                        <Plus size={14} /> Add set
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              background: C.card,
              borderTop: `1px solid ${C.cardBorder}`,
              paddingTop: 12,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: C.muted }}>{loggedSetCount} sets logged</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{totalVolume.toLocaleString()} kg total volume</div>
            </div>
            <button
              onClick={saveWorkout}
              disabled={saving}
              style={{
                background: saved ? C.green : C.amber,
                color: "#12151A",
                fontWeight: 800,
                fontSize: 13.5,
                borderRadius: 10,
                padding: "11px 18px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saved ? (
                <>
                  <Check size={16} /> Saved
                </>
              ) : saving ? (
                "Saving…"
              ) : (
                "Save workout"
              )}
            </button>
          </div>
        </>
      ) : view === "week" ? (
        <div className="px-5 pt-4 flex flex-col gap-4">
          {archiveMsg && (
            <div
              className="px-3 py-2"
              style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8, fontSize: 12.5, color: "#B7E0C6" }}
            >
              {archiveMsg}
            </div>
          )}

          {/* Current week card */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              This week · {fmtShort(currentWeekMonday)} – {fmtShort(currentWeekSunday)}
            </div>
            <div className="flex gap-6 mt-2">
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.totalVolume.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.muted }}>kg volume</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.totalSets}</div>
                <div style={{ fontSize: 11, color: C.muted }}>sets</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{weekAgg.sessionsCount}</div>
                <div style={{ fontSize: 11, color: C.muted }}>sessions</div>
              </div>
            </div>

            {Object.keys(weekAgg.perExercise).length > 0 && (
              <div className="mt-4">
                {Object.entries(weekAgg.perExercise).map(([name, agg]) => (
                  <div key={name} className="flex items-center justify-between py-1.5" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                    <div style={{ fontSize: 12.5 }}>{name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      best {agg.bestWeight || "–"}kg · {agg.volume.toLocaleString()}kg vol
                    </div>
                  </div>
                ))}
              </div>
            )}

            {weekAgg.sessionsCount === 0 && (
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10 }}>No sessions logged this week yet.</div>
            )}

            <div className="mt-4" style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 12 }}>
              {!confirmingReset ? (
                <button
                  onClick={() => setConfirmingReset(true)}
                  disabled={weekAgg.sessionsCount === 0}
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: weekAgg.sessionsCount === 0 ? C.muted : C.amber,
                    opacity: weekAgg.sessionsCount === 0 ? 0.5 : 1,
                  }}
                >
                  <Archive size={14} /> Archive &amp; reset this week
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: C.text, marginBottom: 8 }}>
                    This saves the week's totals permanently, then clears this week's individual sessions. Your saved totals
                    can't be un-reset — continue?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={archiveAndResetWeek}
                      disabled={archiving}
                      style={{
                        background: C.amber,
                        color: "#12151A",
                        fontWeight: 800,
                        fontSize: 12.5,
                        borderRadius: 8,
                        padding: "8px 14px",
                      }}
                    >
                      {archiving ? "Archiving…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmingReset(false)}
                      style={{
                        border: `1px solid ${C.cardBorder}`,
                        color: C.muted,
                        fontWeight: 700,
                        fontSize: 12.5,
                        borderRadius: 8,
                        padding: "8px 14px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Past weeks archive */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Past weeks
            </div>
            {weeklyArchive.length === 0 && (
              <div style={{ fontSize: 12.5, color: C.muted }}>No archived weeks yet.</div>
            )}
            <div className="flex flex-col gap-2">
              {weeklyArchive.map((w) => (
                <div
                  key={w.weekKey}
                  style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "10px 14px" }}
                  className="flex items-center justify-between"
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {fmtShort(w.startDate)} – {fmtShort(w.endDate)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {w.totalVolume.toLocaleString()}kg · {w.totalSets} sets · {w.sessionsCount} sessions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & restore — protects against iOS clearing home-screen app storage */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Backup your data</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
              iPhone can occasionally clear storage for home-screen apps like this one that aren't backed by a server.
              Export a backup file after archiving each week, and you can always restore it if that happens.
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportBackup}
                style={{
                  background: C.amberSoft,
                  color: C.amber,
                  fontWeight: 700,
                  fontSize: 12.5,
                  borderRadius: 8,
                  padding: "9px 14px",
                }}
              >
                Export backup
              </button>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={restoring}
                style={{
                  border: `1px solid ${C.cardBorder}`,
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 12.5,
                  borderRadius: 8,
                  padding: "9px 14px",
                  opacity: restoring ? 0.6 : 1,
                }}
              >
                {restoring ? "Restoring…" : "Restore from file"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) importBackup(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
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
              <div
                key={s.key}
                style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, overflow: "hidden" }}
              >
                <button
                  onClick={() => loadSessionDetail(s.key)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="text-left">
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{(DAYS[s.day] && DAYS[s.day].short) || s.day}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {s.date} · {s.totalVolume.toLocaleString()} kg volume
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
                </button>
                {isOpen && detail && (
                  <div className="px-4 pb-4">
                    {Object.entries(detail.entries).map(([name, rows]) => (
                      <div key={name} className="mb-2.5">
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                        <div style={{ fontSize: 12.5, color: C.muted }}>
                          {rows.map((r) => `${r.reps || "–"}×${r.weight || "–"}kg`).join("  ·  ")}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => deleteSession(s.key)}
                      className="flex items-center gap-1.5 mt-2"
                      style={{ color: C.danger, fontSize: 12, fontWeight: 700 }}
                    >
                      <X size={13} /> Delete session
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 pt-4 flex flex-col gap-4">
          {/* Daily target summary */}
          <div style={{ background: C.card, border: `1px solid ${C.amber}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Daily Target
            </div>
            <div className="flex gap-5">
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{NUTRITION.target.kcal.toLocaleString()}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>kcal</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{NUTRITION.target.protein}g</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>protein</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{NUTRITION.target.carbs}g</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>carbs</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{NUTRITION.target.fat}g</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>fat</div>
              </div>
            </div>
          </div>

          {/* Today's food log */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Today's Log
              </div>
              <div style={{ fontSize: 11.5, color: C.amber, fontWeight: 700 }}>
                {todayTotals.kcal.toLocaleString()} / {NUTRITION.target.kcal.toLocaleString()} kcal
              </div>
            </div>

            {/* progress bar */}
            <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (todayTotals.kcal / NUTRITION.target.kcal) * 100)}%`,
                  background: todayTotals.kcal > NUTRITION.target.kcal ? C.danger : C.amber,
                }}
              />
            </div>

            <div className="flex gap-5" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: C.muted }}>
                {todayTotals.protein}g <span style={{ color: C.text }}>P</span>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted }}>
                {todayTotals.carbs}g <span style={{ color: C.text }}>C</span>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted }}>
                {todayTotals.fat}g <span style={{ color: C.text }}>F</span>
              </div>
            </div>

            {/* logged items */}
            {logLoaded && todayLog.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {todayLog.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                    style={{ padding: "7px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}
                  >
                    <div>
                      <div>{f.name}</div>
                      {f.source && (
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{f.source}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ color: C.muted, fontSize: 11.5, whiteSpace: "nowrap" }}>
                        {f.kcal} kcal · {f.protein}P {f.carbs}C {f.fat}F
                      </div>
                      <button onClick={() => deleteFoodEntry(i)} style={{ color: C.muted, padding: 4 }} aria-label="Remove food">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* add food */}
            {!manualMode ? (
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                  Log a food — Claude searches for real nutrition data on chain/branded items {aiAvailable ? "" : "(unavailable here — manual entry only)"}
                </div>
                <div className="flex gap-2">
                  <input
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    placeholder="e.g. 150g grilled chicken breast"
                    style={{
                      flex: 1,
                      background: C.bg,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 8,
                      padding: "9px 10px",
                      color: C.text,
                      fontSize: 13,
                    }}
                  />
                  <button
                    onClick={handleLookup}
                    disabled={lookupLoading || !foodQuery.trim()}
                    style={{
                      background: C.amber,
                      color: "#12151A",
                      fontWeight: 800,
                      fontSize: 12.5,
                      borderRadius: 8,
                      padding: "9px 14px",
                      opacity: lookupLoading || !foodQuery.trim() ? 0.6 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lookupLoading ? "Looking up…" : "Log it"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setManualMode(true);
                    setManualFood((prev) => ({ ...prev, name: foodQuery }));
                  }}
                  style={{ fontSize: 11.5, color: C.muted, marginTop: 8, textDecoration: "underline" }}
                >
                  Enter macros manually instead
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Add food manually</div>
                <input
                  value={manualFood.name}
                  onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                  placeholder="Food name"
                  style={{
                    width: "100%",
                    background: C.bg,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 8,
                    padding: "9px 10px",
                    color: C.text,
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                />
                <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 10 }}>
                  {["kcal", "protein", "carbs", "fat"].map((field) => (
                    <input
                      key={field}
                      inputMode="numeric"
                      value={manualFood[field]}
                      onChange={(e) => setManualFood({ ...manualFood, [field]: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder={field}
                      style={{
                        background: C.bg,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 8,
                        padding: "8px 6px",
                        color: C.text,
                        fontSize: 12,
                        textAlign: "center",
                        width: "100%",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleManualAdd}
                    style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setManualMode(false);
                      setLookupError("");
                    }}
                    style={{ border: `1px solid ${C.cardBorder}`, color: C.muted, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {lookupError && (
              <div style={{ fontSize: 11.5, color: C.danger, marginTop: 8 }}>{lookupError}</div>
            )}

            {archiveFoodMsg && (
              <div
                style={{ background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 8, padding: "8px 10px", fontSize: 11.5, color: "#B7E0C6", marginTop: 10 }}
              >
                {archiveFoodMsg}
              </div>
            )}

            <div className="mt-4" style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 12 }}>
              {!confirmingFoodReset ? (
                <button
                  onClick={() => setConfirmingFoodReset(true)}
                  disabled={todayLog.length === 0}
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: todayLog.length === 0 ? C.muted : C.amber,
                    opacity: todayLog.length === 0 ? 0.5 : 1,
                  }}
                >
                  <Archive size={14} /> Archive day &amp; reset
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: C.text, marginBottom: 8 }}>
                    This saves today's log permanently to history, then clears it so you can start fresh. Continue?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={archiveTodayAndReset}
                      disabled={archivingFood}
                      style={{ background: C.amber, color: "#12151A", fontWeight: 800, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}
                    >
                      {archivingFood ? "Archiving…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmingFoodReset(false)}
                      style={{ border: `1px solid ${C.cardBorder}`, color: C.muted, fontWeight: 700, fontSize: 12.5, borderRadius: 8, padding: "8px 14px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Food log history */}
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
              Food Log History
            </div>
            {foodHistory.filter((d) => d.archived || d.date !== todayISO()).length === 0 && (
              <div style={{ fontSize: 12.5, color: C.muted }}>
                Past days you've logged food will show up here.
              </div>
            )}
            <div className="flex flex-col gap-2">
              {foodHistory
                .filter((d) => d.archived || d.date !== todayISO())
                .map((d) => {
                  const isOpen = expandedLogDate === d.key;
                  const items = logDateDetail[d.key];
                  const overTarget = d.kcal > NUTRITION.target.kcal;
                  return (
                    <div
                      key={d.key}
                      style={{ border: `1px solid ${d.archived ? C.amber : C.cardBorder}`, borderRadius: 10, overflow: "hidden" }}
                    >
                      <button
                        onClick={() => loadLogDateDetail(d.key)}
                        className="w-full flex items-center justify-between"
                        style={{ padding: "10px 12px" }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                          {fmtShort(d.date)}
                          {d.archived && d.date === todayISO() && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: C.amber, fontWeight: 800 }}>ARCHIVED</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div style={{ fontSize: 11.5, color: overTarget ? C.danger : C.muted }}>
                            {d.kcal.toLocaleString()} kcal · {d.protein}P {d.carbs}C {d.fat}F · {d.items} items
                          </div>
                          {isOpen ? <ChevronUp size={14} color={C.muted} /> : <ChevronDown size={14} color={C.muted} />}
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "0 12px 12px" }}>
                          {(items || []).map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                              style={{ padding: "5px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12 }}
                            >
                              <div>
                                <div>{f.name}</div>
                                {f.source && (
                                  <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{f.source}</div>
                                )}
                              </div>
                              <div style={{ color: C.muted, fontSize: 11 }}>
                                {f.kcal} kcal · {f.protein}P {f.carbs}C {f.fat}F
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => deleteLogDate(d.key)}
                            className="flex items-center gap-1.5 mt-2"
                            style={{ color: C.danger, fontSize: 11.5, fontWeight: 700 }}
                          >
                            <X size={12} /> Delete this day
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Meals */}
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 4 }}>
            Reference Meal Plan
          </div>
          {NUTRITION.meals.map((meal) => {
            const totals = meal.foods.reduce(
              (acc, f) => ({
                kcal: acc.kcal + f.kcal,
                protein: acc.protein + f.protein,
                carbs: acc.carbs + f.carbs,
                fat: acc.fat + f.fat,
              }),
              { kcal: 0, protein: 0, carbs: 0, fat: 0 }
            );
            return (
              <div
                key={meal.name}
                style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{meal.name}</div>
                  <div style={{ fontSize: 11.5, color: C.amber, fontWeight: 700 }}>{meal.time}</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>{meal.note}</div>

                {meal.foods.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between"
                    style={{ padding: "6px 0", borderTop: `1px solid ${C.cardBorder}`, fontSize: 12.5 }}
                  >
                    <div>
                      <span>{f.name}</span>
                      <span style={{ color: C.muted }}> · {f.amount}</span>
                    </div>
                    <div style={{ color: C.muted, fontSize: 11.5, whiteSpace: "nowrap", marginLeft: 8 }}>
                      {f.kcal} kcal
                    </div>
                  </div>
                ))}

                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: 8, marginTop: 4, borderTop: `1px solid ${C.amber}` }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>Meal Total</div>
                  <div style={{ fontSize: 11.5, color: C.text }}>
                    {totals.kcal} kcal · {totals.protein}P · {totals.carbs}C · {totals.fat}F
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
