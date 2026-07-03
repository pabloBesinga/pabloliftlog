import { useState, useEffect, useCallback } from "react";
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

const DAYS = {
  Monday: {
    label: "Monday — Lower",
    exercises: [
      { name: "Smith Machine Squat", target: "4×4–6", key: true },
      { name: "Romanian Deadlift (Smith)", target: "3×6–8" },
      { name: "Leg Press", target: "3×8–10" },
      { name: "Seated Leg Curl", target: "3×10–12" },
      { name: "Leg Extension", target: "3×12–15" },
      { name: "Hip Thrust Machine", target: "3×10–12" },
      { name: "Standing Calf Raise", target: "3×12–15" },
      { name: "Cable Crunch", target: "3×12–15", isNew: true },
      { name: "Hanging Leg Raise", target: "3×10–12", isNew: true },
    ],
  },
  Wednesday: {
    label: "Wednesday — Push",
    exercises: [
      { name: "Incline Press Machine", target: "4×6–8", key: true },
      { name: "Machine Shoulder Press", target: "3×8–10" },
      { name: "Flat Machine Chest Press", target: "3×10–12" },
      { name: "Cable Lateral Raise", target: "3×12–15" },
      { name: "Pec Deck / Cable Fly", target: "3×12–15" },
      { name: "Rope Tricep Pushdown", target: "3×12–15" },
      { name: "Overhead Cable Tricep Ext.", target: "2×12–15" },
    ],
  },
  Friday: {
    label: "Friday — Pull",
    exercises: [
      { name: "Lat Pulldown", target: "4×6–8", key: true },
      { name: "Machine High Row", target: "3×8–10" },
      { name: "Rack Pull (below knee)", target: "3×5–6" },
      { name: "Seated Cable Row", target: "3×10–12" },
      { name: "Assisted Pull-Up", target: "3×6–10" },
      { name: "Rear Delt Fly Machine", target: "3×12–15" },
      { name: "Cable Crunch", target: "3×12–15", isNew: true },
      { name: "Hanging Leg Raise", target: "3×10–12", isNew: true },
      { name: "DB Curl (alternating)", target: "3×10–12" },
      { name: "Hammer Curl", target: "2×10–12" },
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
  const [view, setView] = useState("log"); // 'log' | 'history' | 'week'
  const [day, setDay] = useState("Monday");
  const [entries, setEntries] = useState({});
  const [openEx, setOpenEx] = useState(() => new Set(DAYS.Monday.exercises.map((e) => e.name)));
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

  useEffect(() => {
    const init = {};
    DAYS[day].exercises.forEach((e) => {
      init[e.name] = [emptySetRow()];
    });
    setEntries(init);
    setOpenEx(new Set(DAYS[day].exercises.map((e) => e.name)));
    setSaved(false);
  }, [day]);

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
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "8px 4px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        border: `1px solid ${view === id ? C.amber : C.cardBorder}`,
        background: view === id ? C.amberSoft : "transparent",
        color: view === id ? C.amber : C.muted,
      }}
    >
      <Icon size={14} /> {label}
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
          {view === "log" ? "Log today's sets" : view === "history" ? "Session history" : "Weekly summary"}
        </div>
        <div className="flex gap-2">
          <TabButton id="log" icon={Dumbbell} label="Log" />
          <TabButton id="week" icon={Calendar} label="Week" />
          <TabButton id="history" icon={History} label="History" />
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
          <div className="flex gap-2 px-5 pt-4">
            {Object.keys(DAYS).map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                style={{
                  flex: 1,
                  padding: "9px 4px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: `1px solid ${day === d ? C.amber : C.cardBorder}`,
                  background: day === d ? C.amberSoft : "transparent",
                  color: day === d ? C.amber : C.muted,
                }}
              >
                {d}
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
        </div>
      ) : (
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
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{s.day}</div>
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
      )}
    </div>
  );
}
