import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Palette ───────────────────────────────────────────── */
const C = {
  bg0:    "#03080F",
  bg1:    "#07121E",
  bg2:    "#0C1D2E",
  bg3:    "#112539",
  border: "#1A3249",
  borderBright: "#243E5A",
  gold:   "#C8A84B",
  goldBright: "#F0C868",
  goldDim: "#7A6128",
  indigo: "#5B7CF8",
  indigoDim: "#1E2D6B",
  red:    "#E8445A",
  redDim: "#3D1018",
  green:  "#2EC67A",
  greenDim: "#0D3320",
  text:   "#DDE6F0",
  textMid:"#8BA3BC",
  textDim:"#4A6278",
};

/* ─── Fraud alert data cycling in the hero mock ─────────── */
const ALERTS = [
  {
    severity: "CRITICAL",
    type: "Ghost Employee",
    employee: "EMP0047 · Faisal Mehmood",
    detail: "No attendance in 63 days",
    confidence: 90,
    color: C.red,
  },
  {
    severity: "HIGH",
    type: "Duplicate Bank Account",
    employee: "EMP0023 · Sara Iqbal",
    detail: "Shared account with EMP0031",
    confidence: 95,
    color: "#F07840",
  },
  {
    severity: "HIGH",
    type: "Salary Spike Detected",
    employee: "EMP0011 · Usman Tariq",
    detail: "+67% salary increase via backdating",
    confidence: 75,
    color: "#F07840",
  },
  {
    severity: "CRITICAL",
    type: "Duplicate Payment",
    employee: "EMP0055 · Ayesha Noor",
    detail: "Two payslips issued for March 2025",
    confidence: 98,
    color: C.red,
  },
];

/* ─── Feature cards ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: "🛡",
    title: "AI Fraud Detection",
    desc: "10 independent algorithms run in parallel — ghost employees, duplicate payments, round-trip salary manipulation, and more.",
    tag: "10 algorithms",
    tagColor: C.red,
  },
  {
    icon: "📊",
    title: "Salary Anomaly Detection",
    desc: "Z-score statistical analysis flags outliers by department and designation before payroll is approved.",
    tag: "Z-score engine",
    tagColor: C.indigo,
  },
  {
    icon: "🔮",
    title: "Payroll Forecasting",
    desc: "Time-series trend analysis with seasonal adjustments. Know next month's payroll before the cycle runs.",
    tag: "Predictive AI",
    tagColor: C.indigo,
  },
  {
    icon: "🇵🇰",
    title: "FBR Tax Compliance",
    desc: "Full 2024-25 FBR tax slab support for filers and non-filers. EOBI and SESSI calculated automatically.",
    tag: "Pakistan-compliant",
    tagColor: C.green,
  },
  {
    icon: "💬",
    title: "HR Intelligence Chatbot",
    desc: "Ask about payslips, leave balances, tax deductions, or attendance in plain language. Answers from live data.",
    tag: "8 intent types",
    tagColor: C.gold,
  },
  {
    icon: "⏱",
    title: "Smart Attendance",
    desc: "Overtime contradiction detection catches employees claiming OT on absent days. Full heatmap visualization.",
    tag: "Auto-validated",
    tagColor: C.green,
  },
];

/* ─── All 10 fraud algorithms ───────────────────────────── */
const ALGORITHMS = [
  { name: "Duplicate Bank Accounts",        confidence: 95, severity: "critical" },
  { name: "Salary Spikes",                  confidence: 75, severity: "high"     },
  { name: "Ghost Employees",                confidence: 90, severity: "critical" },
  { name: "Overtime Anomalies",             confidence: 65, severity: "medium"   },
  { name: "Duplicate Payments",             confidence: 98, severity: "critical" },
  { name: "Round-Trip Salary",              confidence: 82, severity: "high"     },
  { name: "Payroll on Full-Leave",          confidence: 78, severity: "high"     },
  { name: "Suspicious New Hire",            confidence: 92, severity: "critical" },
  { name: "Sick Leave Abuse (Z-score)",     confidence: 72, severity: "medium"   },
  { name: "OT/Absent Contradiction",        confidence: 88, severity: "high"     },
];

const SEV_COLOR: Record<string, string> = {
  critical: C.red,
  high: "#F07840",
  medium: C.gold,
};

/* ─── Intersection observer hook ───────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Scroll-aware nav ──────────────────────────────────── */
function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const [alertIdx, setAlertIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const scrolled = useScrolled();

  /* Cycle fraud alerts every 3.5 s */
  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setAlertIdx(i => (i + 1) % ALERTS.length);
        setAnimating(false);
      }, 350);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const alert = ALERTS[alertIdx];

  const featReveal = useReveal();
  const algoReveal = useReveal();
  const statsReveal = useReveal();

  return (
    <div
      style={{
        background: C.bg0,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 2rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? `${C.bg1}EE` : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "all 0.35s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.indigo}, #8B5CF6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: C.text,
            }}
          >
            PayrollX
          </span>
        </div>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            fontSize: "0.875rem",
            color: C.textMid,
          }}
          className="hidden md:flex"
        >
          {["Features", "AI Security", "Compliance"].map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(" ", "-")}`}
              style={{
                color: C.textMid,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMid)}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/login"
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.indigo}, #7C5CF6)`,
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.2s, transform 0.2s",
            boxShadow: `0 4px 20px ${C.indigo}44`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = "0.88";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Sign In
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${C.border} 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
            opacity: 0.35,
          }}
        />
        {/* Radial glow centre-left */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "15%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.indigo}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        {/* Gold glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.gold}12 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            paddingTop: "4rem",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Left: copy */}
          <div>
            <div
              className="lp-animate-fade-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                border: `1px solid ${C.gold}55`,
                background: `${C.gold}12`,
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: C.gold,
                marginBottom: "1.5rem",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.green,
                  display: "inline-block",
                  boxShadow: `0 0 8px ${C.green}`,
                }}
              />
              Live Fraud Detection Active
            </div>

            <h1
              className="lp-animate-fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.8rem, 5vw, 4.2rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: C.text,
                marginBottom: "1.5rem",
                animationDelay: "0.1s",
              }}
            >
              Pakistan's Most
              <br />
              <span
                style={{
                  background: `linear-gradient(90deg, ${C.goldBright}, ${C.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Intelligent
              </span>
              <br />
              Payroll Platform
            </h1>

            <p
              className="lp-animate-fade-up"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: C.textMid,
                maxWidth: 480,
                marginBottom: "2.5rem",
                animationDelay: "0.2s",
              }}
            >
              10 AI algorithms detect payroll fraud in real-time. Full FBR
              2024-25 tax compliance, EOBI &amp; SESSI automation, and an HR
              chatbot that answers from live data.
            </p>

            <div
              className="lp-animate-fade-up"
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                animationDelay: "0.3s",
              }}
            >
              <Link
                to="/login"
                style={{
                  padding: "0.8rem 2rem",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.indigo}, #7C5CF6)`,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  boxShadow: `0 8px 32px ${C.indigo}55`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${C.indigo}77`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${C.indigo}55`;
                }}
              >
                Get Started →
              </Link>
              <a
                href="#features"
                style={{
                  padding: "0.8rem 2rem",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  color: C.textMid,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                  background: `${C.bg2}88`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.borderBright;
                  (e.currentTarget as HTMLElement).style.color = C.text;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLElement).style.color = C.textMid;
                }}
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Right: fraud detection mock */}
          <div
            className="lp-animate-fade-up lp-animate-float"
            style={{ animationDelay: "0.25s", position: "relative" }}
          >
            {/* Main card */}
            <div
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: `0 32px 80px #000A, 0 0 0 1px ${C.border}`,
                position: "relative",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.bg3,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1rem" }}>🛡</span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      letterSpacing: "0.04em",
                      color: C.text,
                    }}
                  >
                    FRAUD DETECTION CENTER
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.green,
                      display: "inline-block",
                      boxShadow: `0 0 10px ${C.green}`,
                      animation: "lp-pulse-ring 1.5s ease-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: C.green,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                    }}
                  >
                    LIVE
                  </span>
                </div>
              </div>

              {/* Scan line overlay */}
              <div style={{ position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${C.indigo}88, transparent)`,
                    animation: "lp-scan-line 2.5s linear infinite",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />

                {/* Alert panel */}
                <div
                  style={{
                    padding: "1.1rem 1.25rem",
                    borderBottom: `1px solid ${C.border}`,
                    transition: "opacity 0.35s ease",
                    opacity: animating ? 0 : 1,
                    transform: animating ? "translateY(-4px)" : "translateY(0)",
                    minHeight: 130,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    <span
                      style={{
                        padding: "0.15rem 0.55rem",
                        borderRadius: 4,
                        background: `${alert.color}22`,
                        border: `1px solid ${alert.color}55`,
                        color: alert.color,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: C.textMid }}>
                      {alert.type}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.78rem",
                      color: C.text,
                      marginBottom: "0.35rem",
                      fontWeight: 600,
                    }}
                  >
                    {alert.employee}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: C.textMid,
                      marginBottom: "0.9rem",
                    }}
                  >
                    {alert.detail}
                  </div>

                  {/* Confidence bar */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.35rem",
                        fontSize: "0.72rem",
                        color: C.textDim,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <span>confidence</span>
                      <span style={{ color: alert.color, fontWeight: 700 }}>
                        {alert.confidence}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        borderRadius: 3,
                        background: `${C.border}`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${alert.confidence}%`,
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${alert.color}88, ${alert.color})`,
                          transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Risk leaderboard */}
                <div style={{ padding: "1rem 1.25rem", background: C.bg1 }}>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: C.textDim,
                      letterSpacing: "0.08em",
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Employee Risk Distribution
                  </div>
                  {[
                    { label: "Critical", pct: 72, color: C.red, count: 3 },
                    { label: "High",     pct: 55, color: "#F07840", count: 7 },
                    { label: "Medium",   pct: 38, color: C.gold, count: 12 },
                  ].map(r => (
                    <div
                      key={r.label}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: r.color,
                          width: 52,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {r.label}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          background: C.border,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${r.pct}%`,
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${r.color}66, ${r.color})`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: C.textDim,
                          fontFamily: "'JetBrains Mono', monospace",
                          width: 20,
                          textAlign: "right",
                        }}
                      >
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer bar */}
                <div
                  style={{
                    padding: "0.65rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: C.textDim,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    10 algorithms · 22 employees scanned
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: C.green,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                    }}
                  >
                    ● Running
                  </span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="lp-animate-float-slow"
              style={{
                position: "absolute",
                bottom: -18,
                left: -20,
                padding: "0.6rem 1rem",
                borderRadius: 10,
                background: C.bg3,
                border: `1px solid ${C.border}`,
                boxShadow: `0 8px 24px #0008`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.78rem",
                color: C.text,
                fontWeight: 600,
              }}
            >
              <span style={{ color: C.green, fontSize: "1rem" }}>✓</span>
              FBR 2024-25 Compliant
            </div>

            {/* Floating badge 2 */}
            <div
              className="lp-animate-float"
              style={{
                position: "absolute",
                top: -16,
                right: -18,
                padding: "0.55rem 0.9rem",
                borderRadius: 10,
                background: `${C.redDim}`,
                border: `1px solid ${C.red}44`,
                boxShadow: `0 8px 24px #0008`,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.75rem",
                color: C.red,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                animationDelay: "2s",
              }}
            >
              <span>⚠</span> 4 alerts active
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE STRIP ─────────────────────────────── */}
      <div
        id="compliance"
        style={{
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "1.25rem 2rem",
          background: C.bg1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: C.textDim,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Built for Pakistan's enterprises
        </span>
        {[
          { label: "FBR 2024-25",  desc: "Tax slabs" },
          { label: "EOBI",         desc: "0.75% auto" },
          { label: "SESSI",        desc: "Wages ≤ 25K" },
          { label: "JWT Auth",     desc: "15-min tokens" },
          { label: "Role-based",   desc: "Admin / HR / Employee" },
        ].map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                padding: "0.2rem 0.55rem",
                borderRadius: 5,
                background: `${C.green}18`,
                border: `1px solid ${C.green}44`,
                color: C.green,
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              {b.label}
            </span>
            <span style={{ fontSize: "0.75rem", color: C.textDim }}>{b.desc}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section
        id="features"
        ref={featReveal.ref}
        style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: C.gold,
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Platform Capabilities
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: C.text,
              letterSpacing: "-0.02em",
            }}
          >
            Everything your payroll team needs
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                padding: "1.75rem",
                borderRadius: 14,
                background: C.bg2,
                border: `1px solid ${C.border}`,
                transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                cursor: "default",
                opacity: featReveal.visible ? 1 : 0,
                transform: featReveal.visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 0.07}s`,
                transitionProperty: "opacity, transform, border-color, box-shadow",
                transitionDuration: "0.6s",
                transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.borderBright;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px #0006`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.border;
                (e.currentTarget as HTMLElement).style.transform = featReveal.visible ? "translateY(0)" : "translateY(24px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{f.icon}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {f.title}
                </h3>
                <span
                  style={{
                    padding: "0.12rem 0.5rem",
                    borderRadius: 4,
                    background: `${f.tagColor}18`,
                    border: `1px solid ${f.tagColor}44`,
                    color: f.tagColor,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.tag}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: C.textMid }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI FRAUD ALGORITHMS SHOWCASE ─────────────────── */}
      <section
        id="ai-security"
        ref={algoReveal.ref}
        style={{
          background: C.bg1,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "6rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.red}0A 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Left: copy */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.14em",
                  color: C.red,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                AI Security Layer
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.5rem",
                }}
              >
                10 fraud detection
                <br />
                <span
                  style={{
                    background: `linear-gradient(90deg, ${C.red}, #F07840)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  algorithms, always on
                </span>
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  color: C.textMid,
                  marginBottom: "2rem",
                  maxWidth: 420,
                }}
              >
                Every payroll run is automatically cross-examined by 10
                independent detection engines. Alerts are saved with confidence
                scores, case status tracking, and resolution notes — a complete
                audit trail for every finding.
              </p>

              {/* Alert flow */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: 10,
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.75rem",
                }}
              >
                <div style={{ color: C.textDim, marginBottom: "0.6rem" }}>// alert lifecycle</div>
                {["new", "acknowledged", "investigating", "resolved"].map((s, i, arr) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: i < arr.length - 1 ? "0.35rem" : 0 }}>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                        background: i === 0 ? `${C.red}22` : i === 3 ? `${C.green}22` : `${C.gold}22`,
                        color: i === 0 ? C.red : i === 3 ? C.green : C.gold,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        fontSize: "0.68rem",
                      }}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ color: C.textDim }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: algorithm list */}
            <div>
              {ALGORITHMS.map((a, i) => (
                <div
                  key={a.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.9rem",
                    padding: "0.7rem 0",
                    borderBottom: i < ALGORITHMS.length - 1 ? `1px solid ${C.border}` : "none",
                    opacity: algoReveal.visible ? 1 : 0,
                    transform: algoReveal.visible ? "translateX(0)" : "translateX(20px)",
                    transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: `${SEV_COLOR[a.severity]}22`,
                      border: `1px solid ${SEV_COLOR[a.severity]}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      color: SEV_COLOR[a.severity],
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.875rem", color: C.text }}>
                    {a.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: 64,
                        height: 4,
                        borderRadius: 2,
                        background: C.border,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: algoReveal.visible ? `${a.confidence}%` : "0%",
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${SEV_COLOR[a.severity]}77, ${SEV_COLOR[a.severity]})`,
                          transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.06 + 0.3}s`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: SEV_COLOR[a.severity],
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        width: 30,
                        textAlign: "right",
                      }}
                    >
                      {a.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section
        ref={statsReveal.ref}
        style={{ padding: "6rem 2rem" }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0",
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            background: C.bg2,
          }}
        >
          {[
            { num: "10", label: "Fraud Algorithms",    sub: "running in parallel", color: C.red    },
            { num: "98%", label: "Detection Accuracy",  sub: "duplicate payments",  color: C.indigo },
            { num: "5",   label: "Compliance Rules",    sub: "FBR, EOBI, SESSI+",  color: C.green  },
            { num: "<1s", label: "Alert Generation",    sub: "per payroll run",     color: C.gold   },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              style={{
                padding: "2.5rem 2rem",
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                textAlign: "center",
                opacity: statsReveal.visible ? 1 : 0,
                transform: statsReveal.visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: "0.25rem",
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: "0.78rem", color: C.textDim }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        style={{
          padding: "4rem 2rem 6rem",
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.14em",
            color: C.indigo,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Workflow
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            color: C.text,
            letterSpacing: "-0.02em",
            marginBottom: "3.5rem",
          }}
        >
          From payroll run to clean audit in seconds
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: "0",
            alignItems: "center",
          }}
        >
          {[
            { num: "01", icon: "▶", title: "Run Payroll", desc: "Trigger monthly payroll for all employees" },
            { num: "02", icon: "🛡", title: "AI Scans", desc: "10 algorithms analyse every payslip simultaneously" },
            { num: "03", icon: "✓", title: "Review Alerts", desc: "Investigate flagged cases with full evidence trail" },
          ].map((step, i) => (
            <>
              <div
                key={step.num}
                style={{
                  padding: "2rem 1.5rem",
                  borderRadius: 14,
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.7rem",
                    color: C.textDim,
                    marginBottom: "0.75rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{step.icon}</div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: "0.4rem",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: "0.8rem", color: C.textMid, lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
              {i < 2 && (
                <div
                  key={`arrow-${i}`}
                  style={{
                    color: C.textDim,
                    fontSize: "1.2rem",
                    padding: "0 0.75rem",
                    flexShrink: 0,
                  }}
                >
                  →
                </div>
              )}
            </>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "0 2rem 6rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: "100%",
            padding: "4rem 3rem",
            borderRadius: 20,
            background: `linear-gradient(135deg, ${C.bg3} 0%, ${C.bg2} 100%)`,
            border: `1px solid ${C.borderBright}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 40px 100px #0008`,
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.indigo}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: C.text,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
              position: "relative",
            }}
          >
            Ready to secure your payroll?
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: C.textMid,
              lineHeight: 1.6,
              marginBottom: "2.5rem",
              maxWidth: 440,
              margin: "0 auto 2.5rem",
            }}
          >
            Join enterprises across Pakistan using PayrollX to process payroll
            with confidence and zero fraud exposure.
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "0.9rem 2.5rem",
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.indigo}, #7C5CF6)`,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: `0 8px 40px ${C.indigo}66`,
              transition: "transform 0.2s, box-shadow 0.2s",
              position: "relative",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 50px ${C.indigo}88`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${C.indigo}66`;
            }}
          >
            Launch PayrollX →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          background: C.bg1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${C.indigo}, #7C5CF6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: C.text,
            }}
          >
            PayrollX
          </span>
        </div>

        <span
          style={{
            fontSize: "0.78rem",
            color: C.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          AI-Powered Payroll · Pakistan · FYP 2026
        </span>

        <Link
          to="/login"
          style={{
            fontSize: "0.82rem",
            color: C.indigo,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Sign In →
        </Link>
      </footer>
    </div>
  );
}
