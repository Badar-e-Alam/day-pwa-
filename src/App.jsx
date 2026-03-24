import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

function ls(k, v) {
  if (v === undefined) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } }
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

/* ── Supabase cloud sync (debounced) ── */
let _syncTimer = null;
function syncToSupabase(userId, dd, dm) {
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      await supabase.from('user_data').upsert({
        user_id: userId,
        dd,
        dm,
        updated_at: new Date().toISOString()
      });
    } catch {}
  }, 2000);
}

async function loadFromSupabase(userId) {
  try {
    const { data } = await supabase
      .from('user_data')
      .select('dd, dm')
      .eq('user_id', userId)
      .single();
    return data;
  } catch { return null; }
}

function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function addD(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isNow(d) { return fmt(d) === fmt(new Date()); }
function pk(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }

const COLS = ["#E8590C","#D6336C","#5C7CFA","#20C997","#FAB005","#845EF7","#FF6B6B","#51CF66"];
const O = "#E8590C", CV = "'Caveat',cursive", MN = "'JetBrains Mono',monospace";

function mkDay() {
  return {
    tb: Array.from({ length: 17 }, (_, i) => ({ h: 7 + i, l: "" })),
    mf: "", st: ["", "", ""],
    td: [{ t: "", d: false }, { t: "", d: false }, { t: "", d: false }],
    tr: { energy: 0, sleep: 0, prod: 0 },
    hb: [{ n: "10,000 steps", d: false }, { n: "Gym", d: false }, { n: "Read 30 pages", d: false }, { n: "Meditation", d: false }, { n: "2L water", d: false }, { n: "Brain dump", d: false }],
    notes: "", draw: []
  };
}

/* ═══ Canvas ═══ */
function Canvas({ value = [], onChange }) {
  const ref = useRef(null), wr = useRef(null);
  const [on, setOn] = useState(false), [ps, setPs] = useState(value), [cur, setCur] = useState([]);
  const [sz, setSz] = useState(2), [col, setCol] = useState(O), [w, setW] = useState(300);
  useEffect(() => setPs(value || []), [value]);
  useEffect(() => { const ro = new ResizeObserver(e => { const ww = Math.round(e[0].contentRect.width); if (ww > 0) setW(ww); }); if (wr.current) ro.observe(wr.current); return () => ro.disconnect(); }, []);
  const pos = e => { const r = ref.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
  const s = e => { e.preventDefault(); setOn(true); setCur([pos(e)]); };
  const m = e => { if (!on) return; e.preventDefault(); setCur(p => [...p, pos(e)]); };
  const en = () => { if (cur.length > 0) { const n = [...ps, { p: cur, c: col, s: sz }]; setPs(n); onChange(n); } setOn(false); setCur([]); };
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, w, 110); [...ps, ...(cur.length ? [{ p: cur, c: col, s: sz }] : [])].forEach(pt => { if (pt.p.length < 2) return; ctx.beginPath(); ctx.strokeStyle = pt.c; ctx.lineWidth = pt.s; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.moveTo(pt.p[0].x, pt.p[0].y); pt.p.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke(); }); }, [ps, cur, col, sz, w]);
  return (
    <div ref={wr}>
      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
        {["#e8e8e8", O, "#D6336C", "#5C7CFA", "#20C997"].map(c => (<button key={c} onClick={() => setCol(c)} style={{ width: 13, height: 13, borderRadius: "50%", background: c, padding: 0, cursor: "pointer", border: col === c ? `2px solid ${O}` : "1px solid #333" }} />))}
        <input type="range" min={1} max={8} value={sz} onChange={e => setSz(+e.target.value)} style={{ width: 36 }} />
        <button onClick={() => { const n = ps.slice(0, -1); setPs(n); onChange(n); }} style={{ background: "none", border: "none", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: CV }}>undo</button>
        <button onClick={() => { setPs([]); onChange([]); }} style={{ background: "none", border: "none", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: CV }}>clear</button>
      </div>
      <canvas ref={ref} width={w} height={110} onMouseDown={s} onMouseMove={m} onMouseUp={en} onMouseLeave={en} onTouchStart={s} onTouchMove={m} onTouchEnd={en}
        style={{ width: "100%", height: 110, borderRadius: 4, cursor: "crosshair", background: "#111", touchAction: "none", display: "block" }} />
    </div>
  );
}

/* ═══ Dots ═══ */
function Dots({ v, set, label, ac }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
      <span style={{ fontSize: 16, minWidth: 72, color: "#666", fontFamily: CV }}>{label}</span>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(i => (<button key={i} onClick={() => set(v === i ? i - 1 : i)} style={{ width: 15, height: 15, borderRadius: "50%", padding: 0, border: "none", cursor: "pointer", background: i <= v ? (ac || O) : "#2a2a2a", transition: "all .15s" }} />))}
      </div>
    </div>
  );
}

/* ═══ Section Header ═══ */
function SH({ name, color, onN, onC }) {
  const [ed, setEd] = useState(false), [v, setV] = useState(name), [sp, setSp] = useState(false);
  const pr = useRef(null), c = color || O;
  useEffect(() => setV(name), [name]);
  useEffect(() => { if (!sp) return; const h = e => { if (pr.current && !pr.current.contains(e.target)) setSp(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [sp]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 4, marginBottom: 6, borderBottom: "1px solid #1a1a1a", flexShrink: 0, minHeight: 24 }}>
      {ed ? (
        <input value={v} onChange={e => setV(e.target.value)} autoFocus onBlur={() => { setEd(false); onN(v); }} onKeyDown={e => { if (e.key === "Enter") { setEd(false); onN(v); } }}
          style={{ background: "none", border: "none", borderBottom: `1px solid ${c}`, fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: c, fontFamily: CV, outline: "none", padding: 0, width: "100%" }} />
      ) : (
        <span onDoubleClick={() => setEd(true)} title="Double-click to rename" style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: c, fontFamily: CV, cursor: "pointer", userSelect: "none" }}>{name}</span>
      )}
      <div style={{ position: "relative" }} ref={pr}>
        <button onClick={() => setSp(!sp)} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "none", cursor: "pointer", padding: 0 }} />
        {sp && (<div style={{ position: "absolute", right: 0, top: 16, display: "flex", gap: 4, padding: 5, background: "#1a1a1a", borderRadius: 6, zIndex: 20, boxShadow: "0 6px 16px rgba(0,0,0,.6)" }}>
          {COLS.map(cl => (<button key={cl} onClick={() => { onC(cl); setSp(false); }} style={{ width: 14, height: 14, borderRadius: "50%", background: cl, border: "none", cursor: "pointer", padding: 0 }} />))}
        </div>)}
      </div>
    </div>
  );
}

/* ═══ Auth — Real Supabase OAuth ═══ */
function Auth({ onAuth }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const signIn = async (provider) => {
    setLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
    // On success, page redirects to provider then back — onAuthStateChange in App handles the rest
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", fontFamily: CV, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#f0f0f0" }}>day<span style={{ color: O }}>.</span></div>
          <p style={{ color: "#555", fontSize: 20, margin: "6px 0 0" }}>Plan with intention</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => signIn('google')} disabled={!!loading} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px",
            borderRadius: 10, border: "1px solid #222", background: "#111", cursor: loading ? "wait" : "pointer",
            fontSize: 19, fontWeight: 600, color: "#eee", fontFamily: CV, opacity: loading && loading !== 'google' ? 0.4 : 1,
            transition: "opacity .15s"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>
        {error && <p style={{ textAlign: "center", color: "#D6336C", fontSize: 14, marginTop: 16, fontFamily: CV }}>{error}</p>}
        <p style={{ textAlign: "center", color: "#333", fontSize: 14, marginTop: 24, fontFamily: CV }}>Your data syncs securely to the cloud</p>
      </div>
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [days, setDays] = useState({});
  const [ok, setOk] = useState(false);
  const [dr, setDr] = useState(false);
  const [nh, setNh] = useState("");
  const [vw, setVw] = useState("grid");
  const [sm, setSm] = useState({});
  const [bold, setBold] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [mob, setMob] = useState(window.innerWidth < 768);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── Supabase auth listener — handles login, logout, and returning from OAuth redirect ── */
  useEffect(() => {
    const mkUser = (su) => ({
      id: su.id,
      email: su.email,
      name: su.user_metadata?.full_name || su.user_metadata?.name || su.email?.split('@')[0],
      avatar: su.user_metadata?.avatar_url || null,
      provider: su.app_metadata?.provider || 'unknown'
    });

    const mergeAndLoad = async (u) => {
      setUser(u);
      ls("du", u);
      const localDd = ls("dd") || {};
      const localDm = ls("dm") || {};
      const remote = await loadFromSupabase(u.id);
      if (remote) {
        const merged_dd = { ...localDd, ...remote.dd };
        const merged_dm = { ...localDm, ...remote.dm };
        setDays(merged_dd);
        setSm(merged_dm);
        ls("dd", merged_dd);
        ls("dm", merged_dm);
        syncToSupabase(u.id, merged_dd, merged_dm);
      } else {
        setDays(localDd);
        setSm(localDm);
        if (Object.keys(localDd).length > 0) syncToSupabase(u.id, localDd, localDm);
      }
      setOk(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mergeAndLoad(mkUser(session.user)).then(() => setAuthLoading(false));
      } else {
        setDays(ls("dd") || {});
        setSm(ls("dm") || {});
        setOk(true);
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        mergeAndLoad(mkUser(session.user));
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("du");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── Persist to localStorage + sync to Supabase when logged in ── */
  useEffect(() => { if (ok) { ls("dd", days); if (user) syncToSupabase(user.id, days, sm); } }, [days, ok]);
  useEffect(() => { if (ok) { ls("dm", sm); if (user) syncToSupabase(user.id, days, sm); } }, [sm, ok]);

  const dk = fmt(date), day = days[dk] || mkDay();
  const gm = id => sm[id] || {};
  const setM = (id, m) => setSm(p => ({ ...p, [id]: { ...(p[id] || {}), ...m } }));
  const up = useCallback(fn => {
    setDays(p => { const c = p[dk] || mkDay(); return { ...p, [dk]: typeof fn === "function" ? fn(c) : { ...c, ...fn } }; });
  }, [dk]);

  const tds = (day.td || []).map(t => typeof t === "string" ? { t: t.replace("✓", ""), d: t.startsWith("✓") } : t);

  if (!ok || authLoading) return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", fontFamily: CV }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: "#f0f0f0" }}>day<span style={{ color: O }}>.</span></span>
    </div>
  );
  if (!user) return <Auth onAuth={setUser} />;

  let sk = 0, cd = new Date();
  while (sk < 366) { const k = fmt(cd); const d = days[k]; if (d && d.hb?.some(h => h.d)) { sk++; cd = addD(cd, -1); } else break; }

  const bdr = "1px solid #1e1e1e";
  const inp = { background: "transparent", border: "none", color: "#e8e8e8", fontFamily: CV, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: CV, color: "#e8e8e8", overflow: "hidden", position: "fixed", top: 0, left: 0 }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mob ? "4px 6px" : "6px 12px", borderBottom: bdr, flexShrink: 0, background: "#0a0a0a", zIndex: 50, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: mob ? 16 : 20, fontWeight: 700 }}>day<span style={{ color: O }}>.</span></span>
          {sk > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: O, background: "#1a0f08", padding: "1px 5px", borderRadius: 10 }}>{sk}d</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 1, minWidth: 0 }}>
          <button onClick={() => setDate(addD(date, -1))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: mob ? 18 : 20, padding: "2px 4px" }}>‹</button>
          <button onClick={() => setDate(new Date())} style={{ background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: mob ? 13 : 16, fontWeight: 600, color: isNow(date) ? O : "#e8e8e8", fontFamily: CV }}>{date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
          </button>
          <button onClick={() => setDate(addD(date, 1))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: mob ? 18 : 20, padding: "2px 4px" }}>›</button>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center", position: "relative", zIndex: 51 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, border: bdr, borderRadius: 5, overflow: "hidden" }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: mob ? 14 : 16, fontFamily: MN, padding: mob ? "4px 6px" : "2px 6px", minHeight: 32, touchAction: "manipulation" }}>−</button>
            <span style={{ fontSize: 11, color: "#555", fontFamily: MN, minWidth: 32, textAlign: "center" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: mob ? 14 : 16, fontFamily: MN, padding: mob ? "4px 6px" : "2px 6px", minHeight: 32, touchAction: "manipulation" }}>+</button>
          </div>
          <button onClick={() => setVw(vw === "grid" ? "history" : "grid")} style={{ background: "none", border: bdr, borderRadius: 5, padding: mob ? "6px 10px" : "3px 10px", color: vw === "history" ? O : "#555", cursor: "pointer", fontSize: mob ? 13 : 14, fontFamily: CV, fontWeight: 700, minHeight: 32, touchAction: "manipulation" }}>
            {vw === "grid" ? "History" : "Grid"}
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null); localStorage.removeItem("du"); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: mob ? 13 : 14, fontFamily: CV, fontWeight: 600, whiteSpace: "nowrap", minHeight: 32, padding: mob ? "6px 8px" : "3px 6px", touchAction: "manipulation" }}>Sign out</button>
        </div>
      </div>

      {vw === "history" ? (
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            {Object.keys(days).length === 0 && <p style={{ color: "#555", fontSize: 18, textAlign: "center", marginTop: 60 }}>No entries yet</p>}
            {Object.keys(days).sort().reverse().map(k => { const d = days[k], dt = pk(k); return (
              <button key={k} onClick={() => { setDate(dt); setVw("grid"); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 14px", background: "#0f0f0f", border: bdr, borderRadius: 8, marginBottom: 5, cursor: "pointer", textAlign: "left" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e8e8", fontFamily: CV }}>{dt.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</div>
                  {d.mf && <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>{d.mf}</div>}
                </div>
                <div style={{ display: "flex", gap: 3 }}>{d.hb?.map((h, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: h.d ? O : "#222" }} />)}</div>
              </button>
            ); })}
          </div>
        </div>
      ) : (

        /* ═══════════════════════════════════════
           THE GRID
           ┌──────────────────────────────────────┐
           │            MY MAIN FOCUS              │  auto
           ├────────────┬─────────────────────────┤
           │            │   THREE SMALLER TASKS    │
           │   TIME     ├──────────────┬──────────┤
           │   BLOCK    │    TO-DO     │ TRACKERS │  3fr
           │            │              │          │
           ├────────────┼──────────────┴──────────┤
           │   HABITS   │     DIARY / NOTES        │  2fr
           └────────────┴─────────────────────────┘
           ═══════════════════════════════════════ */
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <div style={mob ? {
          display: "flex",
          flexDirection: "column",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
          width: `${10000 / zoom}%`,
          minHeight: `${10000 / zoom}%`
        } : {
          display: "grid",
          gridTemplateColumns: "2fr 5fr",
          gridTemplateRows: "auto 3fr 2fr",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
          width: `${10000 / zoom}%`,
          height: `${10000 / zoom}%`
        }}>

          {/* ── R1: MAIN FOCUS ── */}
          <div style={{ gridColumn: "1 / -1", background: "#0f0f0f", padding: "10px 14px", borderBottom: bdr, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <SH name={gm("f").name || "My Main Focus"} color={gm("f").color} onN={n => setM("f", { name: n })} onC={c => setM("f", { color: c })} />
            <textarea value={day.mf} onChange={e => up({ mf: e.target.value })} placeholder="One thing I REALLY need to get done..." rows={1}
              style={{ ...inp, fontSize: 22, fontWeight: 600, resize: "none", padding: 0, lineHeight: 1.3, width: "100%" }} />
          </div>

          {/* ── R2 LEFT: TIME BLOCKS ── */}
          <div style={{ background: "#0f0f0f", padding: "8px 10px", borderRight: bdr, borderBottom: bdr, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <SH name={gm("t").name || "Time Block"} color={gm("t").color} onN={n => setM("t", { name: n })} onC={c => setM("t", { color: c })} />
            <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
              {day.tb.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0", borderBottom: i < 16 ? "1px solid #141414" : "none" }}>
                  <span style={{ fontSize: 11, fontFamily: MN, color: "#555", width: 34, textAlign: "right", flexShrink: 0 }}>{String(b.h).padStart(2, "0")}:00</span>
                  <input value={b.l} onChange={e => { const t = [...day.tb]; t[i] = { ...t[i], l: e.target.value }; up({ tb: t }); }} placeholder="—"
                    style={{ ...inp, flex: 1, fontSize: 15, padding: "3px 2px", minWidth: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── R2 RIGHT: Tasks top, Todo|Trackers bottom ── */}
          <div style={{ background: "#0f0f0f", borderBottom: bdr, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

            {/* Three Smaller Tasks — fixed height */}
            <div style={{ padding: "8px 14px", borderBottom: bdr, flexShrink: 0 }}>
              <SH name={gm("s").name || "Three Smaller Tasks"} color={gm("s").color} onN={n => setM("s", { name: n })} onC={c => setM("s", { color: c })} />
              {day.st.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "#555", fontFamily: MN, width: 14 }}>{i + 1}.</span>
                  <input value={t} onChange={e => { const s = [...day.st]; s[i] = e.target.value; up({ st: s }); }} placeholder={`Task ${i + 1}`}
                    style={{ ...inp, flex: 1, borderBottom: "1px solid #1a1a1a", fontSize: 16, padding: "4px 0" }} />
                </div>
              ))}
            </div>

            {/* FIX: Todo and Trackers share remaining space EQUALLY */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0, overflow: "hidden" }}>

              {/* To-Do */}
              <div style={{ padding: "8px 12px", borderRight: bdr, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                <SH name={gm("td").name || "To-Do"} color={gm("td").color} onN={n => setM("td", { name: n })} onC={c => setM("td", { color: c })} />
                <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
                  {tds.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <button onClick={() => { const d = [...tds]; d[i] = { ...d[i], d: !d[i].d }; up({ td: d }); }} style={{
                        width: 15, height: 15, borderRadius: 3, flexShrink: 0, padding: 0, cursor: "pointer",
                        border: `1.5px solid ${t.d ? O : "#444"}`, background: t.d ? O : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
                      }}>{t.d && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}</button>
                      <input value={t.t} onChange={e => { const d = [...tds]; d[i] = { ...d[i], t: e.target.value }; up({ td: d }); }} placeholder="to-do"
                        style={{ ...inp, flex: 1, fontSize: 14, padding: "3px 0", textDecoration: t.d ? "line-through" : "none", opacity: t.d ? .4 : 1, minWidth: 0 }} />
                      {tds.length > 1 && <button onClick={() => up({ td: tds.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>×</button>}
                    </div>
                  ))}
                  <button onClick={() => up({ td: [...tds, { t: "", d: false }] })} style={{ background: "none", border: "none", color: O, fontSize: 13, cursor: "pointer", fontFamily: CV, fontWeight: 700, padding: "4px 0" }}>+ add</button>
                </div>
              </div>

              {/* Trackers */}
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <SH name={gm("tr").name || "Trackers"} color={gm("tr").color} onN={n => setM("tr", { name: n })} onC={c => setM("tr", { color: c })} />
                <div style={{ overflow: "auto", flex: 1 }}>
                  <Dots label="Energy" v={day.tr.energy} ac={gm("tr").color} set={v => up({ tr: { ...day.tr, energy: v } })} />
                  <Dots label="Sleep" v={day.tr.sleep} ac={gm("tr").color} set={v => up({ tr: { ...day.tr, sleep: v } })} />
                  <Dots label="Productivity" v={day.tr.prod} ac={gm("tr").color} set={v => up({ tr: { ...day.tr, prod: v } })} />
                </div>
              </div>
            </div>
          </div>

          {/* ── R3 LEFT: HABITS ── */}
          <div style={{ background: "#0f0f0f", padding: "8px 10px", borderRight: bdr, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <SH name={gm("h").name || "Habits"} color={gm("h").color} onN={n => setM("h", { name: n })} onC={c => setM("h", { color: c })} />
            <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
              {day.hb.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", borderBottom: i < day.hb.length - 1 ? "1px solid #141414" : "none" }}>
                  <button onClick={() => { const b = [...day.hb]; b[i] = { ...b[i], d: !b[i].d }; up({ hb: b }); }} style={{
                    width: 15, height: 15, borderRadius: 3, flexShrink: 0, padding: 0, cursor: "pointer",
                    border: `1.5px solid ${h.d ? (gm("h").color || O) : "#444"}`, background: h.d ? (gm("h").color || O) : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
                  }}>{h.d && <span style={{ color: "#fff", fontSize: 9 }}>✓</span>}</button>
                  <span style={{ fontSize: 15, color: "#e8e8e8", opacity: h.d ? .4 : 1, textDecoration: h.d ? "line-through" : "none", flex: 1 }}>{h.n}</span>
                  <button onClick={() => up({ hb: day.hb.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", padding: 0, opacity: .6 }}>×</button>
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <input value={nh} onChange={e => setNh(e.target.value)} placeholder="+ habit"
                  onKeyDown={e => { if (e.key === "Enter" && nh.trim()) { up({ hb: [...day.hb, { n: nh.trim(), d: false }] }); setNh(""); } }}
                  style={{ width: "100%", background: "transparent", border: "1px solid #1e1e1e", borderRadius: 4, color: "#e8e8e8", fontSize: 14, fontFamily: CV, padding: "4px 6px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* ── R3 RIGHT: DIARY / NOTES ── */}
          <div style={{ background: "#0f0f0f", padding: "8px 14px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <SH name={gm("n").name || "Diary / Notes"} color={gm("n").color} onN={n => setM("n", { name: n })} onC={c => setM("n", { color: c })} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minHeight: 0, overflow: "hidden" }}>
              {/* Toolbar: bold + draw toggle */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => setBold(!bold)} style={{ background: bold ? "#1a1a1a" : "transparent", border: "1px solid #1e1e1e", borderRadius: 4, padding: "1px 8px", cursor: "pointer", color: bold ? O : "#555", fontSize: 13, fontWeight: 700, fontFamily: CV }}>B</button>
                <button onClick={() => setDr(!dr)} style={{ background: dr ? "#1a1a1a" : "transparent", border: "1px solid #1e1e1e", borderRadius: 4, padding: "1px 8px", cursor: "pointer", color: dr ? O : "#555", fontSize: 13, fontFamily: CV, display: "flex", alignItems: "center", gap: 3 }}>
                  ✎ draw
                </button>
                {dr && <button onClick={() => { setDr(false); up({ draw: [] }); }} style={{ background: "none", border: "1px solid #1e1e1e", borderRadius: 4, padding: "1px 8px", cursor: "pointer", color: "#D6336C", fontSize: 12, fontFamily: CV }}>× remove drawing</button>}
              </div>

              {/* Notes textarea — takes remaining space when no drawing */}
              {!dr && (
                <textarea value={day.notes} onChange={e => up({ notes: e.target.value })} placeholder="Thoughts, reflections..."
                  style={{ ...inp, flex: 1, minHeight: 0, border: "1px solid #1a1a1a", borderRadius: 4, fontSize: 17, padding: "6px 8px", resize: "none", lineHeight: 1.4, fontWeight: bold ? 700 : 400, width: "100%" }} />
              )}

              {/* When drawing is active: split space between text and canvas */}
              {dr && (
                <>
                  <textarea value={day.notes} onChange={e => up({ notes: e.target.value })} placeholder="Thoughts, reflections..."
                    style={{ ...inp, height: 60, flexShrink: 0, border: "1px solid #1a1a1a", borderRadius: 4, fontSize: 17, padding: "6px 8px", resize: "none", lineHeight: 1.4, fontWeight: bold ? 700 : 400, width: "100%" }} />
                  <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    <Canvas value={day.draw} onChange={d => up({ draw: d })} />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
        </div>
      )}
    </div>
  );
}
