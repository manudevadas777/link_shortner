import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ── Typewriter effect ──────────────────────────────────────────────
function Typewriter({ words }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIndex(i => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index, words]);

  return (
    <span className="typed-word">
      {displayed}
      <span className="cursor">|</span>
    </span>
  );
}

// ── Animated number ─────────────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const dur = 1800;
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setVal(Math.floor(ease * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Navbar ──────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__logo">
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="logo-text">LinkSnap</span>
        </div>
        <div className="navbar__links">
          <a href="#features">Features</a>
          <a href="#analytics">Analytics</a>
          <a href="#how">How it works</a>
        </div>
        <div className="navbar__actions">
          <Link to="/login" className="nav-signin">Sign in</Link>
          <Link to="/register" className="nav-cta">Get Started →</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main ────────────────────────────────────────────────────────────
export default function Landing() {
  const [url, setUrl] = useState('');
  const [demoShort, setDemoShort] = useState('');

  const handleDemo = (e) => {
    e.preventDefault();
    if (!url) return;
    setDemoShort('lnksnp.io/' + Math.random().toString(36).slice(2, 8));
  };

  return (
    <div className="landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #0ea5e9;
          --blue-dark: #0284c7;
          --blue-glow: rgba(14,165,233,0.35);
          --violet: #8b5cf6;
          --violet-glow: rgba(139,92,246,0.25);
          --bg: #03070f;
          --bg2: #060d1a;
          --surface: rgba(255,255,255,0.035);
          --border: rgba(255,255,255,0.07);
          --text: #f0f6ff;
          --muted: rgba(240,246,255,0.45);
          --faint: rgba(240,246,255,0.18);
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        .landing {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s ease;
          padding: 0 2rem;
        }
        .navbar--scrolled {
          background: rgba(3,7,15,0.85);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }
        .navbar__inner {
          max-width: 1200px; margin: 0 auto;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .navbar__logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue), var(--violet));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px var(--blue-glow);
        }
        .logo-text {
          font-family: var(--font-display); font-weight: 800; font-size: 1.2rem;
          background: linear-gradient(135deg, #7dd3fc, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .navbar__links { display: flex; gap: 2rem; }
        .navbar__links a {
          color: var(--muted); text-decoration: none; font-size: 0.875rem; font-weight: 400;
          transition: color 0.2s;
        }
        .navbar__links a:hover { color: var(--text); }
        .navbar__actions { display: flex; align-items: center; gap: 1rem; }
        .nav-signin {
          color: var(--muted); text-decoration: none; font-size: 0.875rem;
          transition: color 0.2s;
        }
        .nav-signin:hover { color: var(--text); }
        .nav-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.5rem 1.25rem; border-radius: 10px;
          background: var(--blue); color: white; text-decoration: none;
          font-size: 0.875rem; font-weight: 500;
          box-shadow: 0 0 20px var(--blue-glow);
          transition: all 0.2s;
        }
        .nav-cta:hover { background: #38bdf8; box-shadow: 0 0 30px var(--blue-glow); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 7rem 2rem 4rem;
          text-align: center;
          position: relative;
        }
        .hero__bg {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
        }
        .hero__orb {
          position: absolute; border-radius: 50%; filter: blur(120px);
        }
        .hero__orb--1 {
          width: 600px; height: 600px; top: -100px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
        }
        .hero__orb--2 {
          width: 400px; height: 400px; bottom: 0; right: -100px;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
        }
        .hero__orb--3 {
          width: 300px; height: 300px; bottom: 100px; left: -50px;
          background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%);
        }

        /* Grid overlay */
        .hero__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%);
        }

        .hero__badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 100px;
          border: 1px solid rgba(14,165,233,0.3);
          background: rgba(14,165,233,0.08);
          color: #7dd3fc; font-size: 0.75rem; font-weight: 500;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }
        .badge__dot {
          width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;
          animation: pulse 2s infinite;
        }

        .hero__headline {
          font-family: var(--font-display);
          font-size: clamp(3rem, 8vw, 6.5rem);
          font-weight: 800; line-height: 1.0;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero__headline .line2 {
          display: block;
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .typed-word { position: relative; }
        .cursor {
          display: inline-block; margin-left: 2px;
          animation: blink 1s step-end infinite;
          color: var(--blue);
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .hero__sub {
          font-size: 1.1rem; color: var(--muted); max-width: 560px;
          line-height: 1.7; margin-bottom: 2.5rem;
          animation: fadeUp 0.6s 0.2s ease both;
          font-weight: 300;
        }

        /* Demo input */
        .demo-form {
          width: 100%; max-width: 580px; margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .demo-input-wrap {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 6px 6px 6px 16px;
          backdrop-filter: blur(20px);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .demo-input-wrap:focus-within {
          border-color: rgba(14,165,233,0.5);
          box-shadow: 0 0 30px rgba(14,165,233,0.12);
        }
        .demo-input-icon { color: var(--faint); margin-right: 10px; flex-shrink: 0; }
        .demo-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
          placeholder-color: var(--faint);
        }
        .demo-input::placeholder { color: rgba(255,255,255,0.2); }
        .demo-btn {
          flex-shrink: 0; padding: 0.6rem 1.5rem; border-radius: 12px;
          background: linear-gradient(135deg, var(--blue), var(--violet));
          color: white; border: none; cursor: pointer;
          font-size: 0.875rem; font-weight: 500; font-family: var(--font-body);
          box-shadow: 0 0 20px var(--blue-glow);
          transition: all 0.2s;
        }
        .demo-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 30px var(--blue-glow); }
        .demo-result {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 12px; animation: fadeUp 0.3s ease;
        }
        .demo-result__url {
          font-family: var(--font-mono); color: #38bdf8; font-size: 0.9rem; font-weight: 500;
        }
        .demo-result__hint { color: var(--faint); font-size: 0.75rem; }

        .hero__ctas {
          display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.85rem 2rem; border-radius: 14px;
          background: linear-gradient(135deg, var(--blue), var(--violet));
          color: white; text-decoration: none; font-weight: 600; font-size: 0.95rem;
          box-shadow: 0 0 30px var(--blue-glow);
          transition: all 0.25s;
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px var(--blue-glow); }
        .cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.85rem 2rem; border-radius: 14px;
          border: 1px solid var(--border); color: var(--muted);
          text-decoration: none; font-weight: 400; font-size: 0.95rem;
          background: var(--surface); backdrop-filter: blur(10px);
          transition: all 0.25s;
        }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .hero__trust {
          margin-top: 1.25rem; color: var(--faint); font-size: 0.78rem;
          animation: fadeUp 0.6s 0.5s ease both;
        }

        /* HERO VISUAL — browser mockup */
        .hero__mockup-wrap {
          width: 100%; max-width: 900px; margin-top: 4rem;
          animation: fadeUp 0.8s 0.5s ease both;
          position: relative;
        }
        .hero__mockup-glow {
          position: absolute; inset: -60px;
          background: radial-gradient(ellipse 60% 40% at 50% 60%, rgba(14,165,233,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .browser-frame {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset;
          backdrop-filter: blur(20px);
        }
        .browser-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .browser-dots { display: flex; gap: 6px; }
        .browser-dot {
          width: 12px; height: 12px; border-radius: 50%;
        }
        .browser-dot:nth-child(1) { background: #ff5f57; }
        .browser-dot:nth-child(2) { background: #ffbd2e; }
        .browser-dot:nth-child(3) { background: #28c840; }
        .browser-url {
          flex: 1; background: rgba(255,255,255,0.06); border-radius: 6px;
          padding: 4px 12px; font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--muted); text-align: left;
        }
        .browser-content {
          padding: 0;
          background: #060d1a;
        }

        /* Dashboard preview inside browser */
        .dash-preview {
          display: grid; grid-template-columns: 200px 1fr;
          height: 360px; overflow: hidden;
        }
        .dash-sidebar {
          background: rgba(255,255,255,0.02);
          border-right: 1px solid var(--border);
          padding: 1rem;
          display: flex; flex-direction: column; gap: 8px;
        }
        .dash-sidebar__logo {
          display: flex; align-items: center; gap: 8px; padding: 8px 0 16px;
          border-bottom: 1px solid var(--border); margin-bottom: 8px;
          font-family: var(--font-display); font-weight: 700; font-size: 0.9rem;
          background: linear-gradient(135deg, #7dd3fc, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .dash-nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px;
          font-size: 0.78rem; color: var(--faint);
        }
        .dash-nav-item--active {
          background: rgba(14,165,233,0.12);
          color: #7dd3fc;
          border: 1px solid rgba(14,165,233,0.2);
        }
        .dash-main {
          padding: 1.25rem; overflow: hidden;
        }
        .dash-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;
        }
        .dash-stat {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 10px 12px;
        }
        .dash-stat__val { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; }
        .dash-stat__label { font-size: 0.68rem; color: var(--faint); margin-top: 2px; }
        .dash-links-header {
          font-size: 0.7rem; font-weight: 600; color: var(--faint);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
        }
        .dash-link-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border);
          margin-bottom: 8px;
        }
        .dash-link-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), var(--violet));
          flex-shrink: 0;
        }
        .dash-link-short { font-family: var(--font-mono); font-size: 0.75rem; color: #7dd3fc; flex: 1; }
        .dash-link-clicks { font-size: 0.72rem; color: var(--faint); }
        .dash-link-badge {
          padding: 2px 8px; border-radius: 20px; font-size: 0.65rem;
          background: rgba(14,165,233,0.12); color: #7dd3fc;
          border: 1px solid rgba(14,165,233,0.2);
        }

        /* Floating cards on hero */
        .float-card {
          position: absolute;
          background: rgba(6,13,26,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 12px 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          animation: float 5s ease-in-out infinite;
        }
        .float-card--1 { right: -60px; top: 20%; animation-delay: 0s; }
        .float-card--2 { left: -60px; top: 50%; animation-delay: 1.5s; }
        .float-card--3 { right: -40px; bottom: 15%; animation-delay: 0.8s; }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* STATS BAR */
        .stats-bar {
          padding: 4rem 2rem;
          position: relative;
        }
        .stats-bar__inner {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }
        .stat-cell {
          padding: 2rem 1.5rem; text-align: center;
          border-right: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 100%, rgba(14,165,233,0.05) 0%, transparent 70%);
        }
        .stat-cell__num {
          font-family: var(--font-display); font-size: 2.2rem; font-weight: 800;
          background: linear-gradient(135deg, #7dd3fc, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          display: block;
        }
        .stat-cell__label { color: var(--faint); font-size: 0.82rem; margin-top: 4px; }

        /* FEATURES */
        .features {
          padding: 6rem 2rem; position: relative;
        }
        .section-tag {
          display: inline-block; font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em; color: var(--blue);
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.02em;
          color: var(--text); margin-bottom: 1rem;
        }
        .section-sub {
          color: var(--muted); font-size: 1rem; max-width: 500px;
          line-height: 1.7; font-weight: 300;
        }
        .features__grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
          margin-top: 3rem;
        }
        .feat-cell {
          padding: 2rem; background: var(--bg2);
          transition: background 0.3s;
          position: relative; overflow: hidden;
        }
        .feat-cell:hover { background: rgba(14,165,233,0.04); }
        .feat-cell::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feat-cell:hover::before { opacity: 1; }
        .feat-icon {
          font-size: 1.75rem; margin-bottom: 1rem; display: block;
        }
        .feat-title {
          font-family: var(--font-display); font-weight: 700; font-size: 1rem;
          color: var(--text); margin-bottom: 0.5rem;
        }
        .feat-desc { color: var(--faint); font-size: 0.85rem; line-height: 1.6; font-weight: 300; }

        /* ANALYTICS SHOWCASE */
        .showcase {
          padding: 6rem 2rem;
          background: linear-gradient(180deg, transparent, rgba(14,165,233,0.03) 50%, transparent);
        }
        .showcase__inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 5rem; align-items: center;
        }
        .showcase__img {
          position: relative; border-radius: 20px; overflow: hidden;
        }
        .analytics-card {
          background: rgba(6,13,26,0.95);
          border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
        }
        .analytics-card__header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1.25rem;
        }
        .analytics-card__title { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
        .live-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 100px; font-size: 0.7rem;
          background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        .chart-bars {
          display: flex; align-items: flex-end; gap: 4px; height: 80px; margin-bottom: 1.25rem;
        }
        .chart-bar {
          flex: 1; border-radius: 4px 4px 0 0;
          background: linear-gradient(to top, var(--blue), #818cf8);
          opacity: 0.6; transition: opacity 0.2s;
        }
        .chart-bar:hover { opacity: 1; }
        .analytics-stats {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 1.25rem;
        }
        .analytics-stat {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 10px; text-align: center;
        }
        .analytics-stat__val { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
        .analytics-stat__label { font-size: 0.65rem; color: var(--faint); }
        .country-list { display: flex; flex-direction: column; gap: 8px; }
        .country-row { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; }
        .country-name { color: var(--muted); width: 130px; flex-shrink: 0; }
        .country-bar-bg { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .country-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--blue), var(--violet)); }
        .country-pct { color: var(--faint); font-size: 0.7rem; width: 32px; text-align: right; }

        /* HOW IT WORKS */
        .how { padding: 6rem 2rem; }
        .how__inner { max-width: 900px; margin: 0 auto; }
        .steps {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 3rem;
          position: relative;
        }
        .steps::before {
          content: ''; position: absolute; top: 28px; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
          opacity: 0.3;
        }
        .step {
          text-align: center; padding: 2rem 1.5rem;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; position: relative; overflow: hidden;
          transition: border-color 0.3s;
        }
        .step:hover { border-color: rgba(14,165,233,0.3); }
        .step__num {
          width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 1.25rem;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 800; font-size: 1.2rem;
          background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(139,92,246,0.2));
          border: 1px solid rgba(14,165,233,0.3); color: #7dd3fc;
        }
        .step__icon { font-size: 1.5rem; margin-bottom: 1rem; display: block; }
        .step__title {
          font-family: var(--font-display); font-weight: 700; font-size: 1rem;
          color: var(--text); margin-bottom: 0.5rem;
        }
        .step__desc { font-size: 0.85rem; color: var(--faint); line-height: 1.6; font-weight: 300; }

        /* REAL WORLD SECTION */
        .real-world {
          padding: 6rem 2rem;
          background: rgba(255,255,255,0.01);
        }
        .image-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 3rem;
        }
        .image-card {
          border-radius: 16px; overflow: hidden; position: relative;
          aspect-ratio: 4/3;
          border: 1px solid var(--border);
        }
        .image-card img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.7) saturate(0.8);
          transition: transform 0.5s, filter 0.3s;
        }
        .image-card:hover img { transform: scale(1.05); filter: brightness(0.85) saturate(1); }
        .image-card__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(3,7,15,0.9) 0%, transparent 50%);
          display: flex; align-items: flex-end; padding: 16px;
        }
        .image-card__label { font-size: 0.85rem; font-weight: 500; color: var(--text); }
        .image-card__sub { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

        /* CTA SECTION */
        .cta-section { padding: 6rem 2rem; }
        .cta-box {
          max-width: 800px; margin: 0 auto; border-radius: 28px; padding: 4rem;
          text-align: center; position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1));
          border: 1px solid rgba(14,165,233,0.2);
        }
        .cta-box::before {
          content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 400px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-box__eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 100px; font-size: 0.78rem;
          background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25);
          color: #7dd3fc; margin-bottom: 1.5rem;
        }
        .cta-box__title {
          font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800; line-height: 1.1; color: var(--text); margin-bottom: 1rem;
        }
        .cta-box__sub {
          color: var(--muted); font-size: 1rem; margin-bottom: 2.5rem;
          font-weight: 300; line-height: 1.7;
        }
        .cta-box__buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border); padding: 2.5rem 2rem;
        }
        footer .inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        footer .copy { color: var(--faint); font-size: 0.78rem; }
        footer .links { display: flex; gap: 1.5rem; }
        footer .links a { color: var(--faint); text-decoration: none; font-size: 0.78rem; transition: color 0.2s; }
        footer .links a:hover { color: var(--text); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        @media (max-width: 768px) {
          .hero__headline { font-size: 2.8rem; }
          .navbar__links { display: none; }
          .stats-bar__inner { grid-template-columns: repeat(2,1fr); }
          .features__grid { grid-template-columns: 1fr; }
          .showcase__inner { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr; }
          .image-grid { grid-template-columns: 1fr; }
          .dash-preview { grid-template-columns: 1fr; }
          .dash-sidebar { display: none; }
          .float-card { display: none; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__grid" />
        </div>

        <div className="hero__badge">
          <div className="badge__dot" />
          AI-Powered · Real-Time Analytics · Free to start
        </div>

        <h1 className="hero__headline">
          Shorten. Share.<br />
          <span className="line2">
            <Typewriter words={['Track Everything.', 'Go Viral.', 'Amplify Reach.', 'Grow Faster.']} />
          </span>
        </h1>

        <p className="hero__sub">
          Turn your long links into powerful branded URLs with real-time analytics, AI-powered insights, QR codes, and global click tracking.
        </p>

        <form className="demo-form" onSubmit={handleDemo}>
          <div className="demo-input-wrap">
            <span className="demo-input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <input
              className="demo-input"
              placeholder="Paste your long URL here…"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button className="demo-btn" type="submit">Shorten →</button>
          </div>
          {demoShort && (
            <div className="demo-result">
              <span className="demo-result__url">✓ {demoShort}</span>
              <span className="demo-result__hint">Sign up to activate</span>
            </div>
          )}
        </form>

        <div className="hero__ctas">
          <Link to="/register" className="cta-primary">Start for Free →</Link>
          <Link to="/login" className="cta-secondary">Sign In</Link>
        </div>
        <p className="hero__trust">No credit card required · Free forever plan · Setup in 30 seconds</p>

        {/* Browser mockup */}
        <div className="hero__mockup-wrap">
          <div className="hero__mockup-glow" />
          <div className="browser-frame">
            <div className="browser-bar">
              <div className="browser-dots">
                <div className="browser-dot" />
                <div className="browser-dot" />
                <div className="browser-dot" />
              </div>
              <div className="browser-url">app.linksnap.io/dashboard</div>
            </div>
            <div className="browser-content">
              <div className="dash-preview">
                <div className="dash-sidebar">
                  <div className="dash-sidebar__logo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                    LinkSnap
                  </div>
                  {[['🔗', 'Dashboard', true], ['📊', 'Analytics', false], ['⚙️', 'Settings', false]].map(([icon, label, active]) => (
                    <div key={label} className={`dash-nav-item ${active ? 'dash-nav-item--active' : ''}`}>
                      <span>{icon}</span> {label}
                    </div>
                  ))}
                </div>
                <div className="dash-main">
                  <div className="dash-stats">
                    {[
                      { val: '24', label: 'Total Links', color: '#7dd3fc' },
                      { val: '12,483', label: 'Total Clicks', color: '#a78bfa' },
                      { val: '↑ 24%', label: 'This Week', color: '#86efac' },
                    ].map(s => (
                      <div className="dash-stat" key={s.label}>
                        <div className="dash-stat__val" style={{ color: s.color }}>{s.val}</div>
                        <div className="dash-stat__label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="dash-links-header">Your Links</div>
                  {[
                    { short: 'lnksnp.io/ai-launch', clicks: '4.2k clicks', tag: 'Tech' },
                    { short: 'lnksnp.io/product-v2', clicks: '3.8k clicks', tag: 'E-Commerce' },
                    { short: 'lnksnp.io/blog-seo', clicks: '2.1k clicks', tag: 'Blog' },
                  ].map(l => (
                    <div className="dash-link-row" key={l.short}>
                      <div className="dash-link-dot" />
                      <div className="dash-link-short">{l.short}</div>
                      <div className="dash-link-clicks">{l.clicks}</div>
                      <div className="dash-link-badge">{l.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="float-card float-card--1">
            <div style={{ fontSize: '0.7rem', color: 'rgba(240,246,255,0.4)', marginBottom: 4 }}>AI Insight</div>
            <div style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600 }}>🤖 Peak hour: 3PM UTC</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(240,246,255,0.3)', marginTop: 2 }}>Schedule posts then</div>
          </div>
          <div className="float-card float-card--2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✓</div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Link Created!</div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>lnksnp.io/launch</div>
              </div>
            </div>
          </div>
          <div className="float-card float-card--3">
            <div style={{ fontSize: '0.7rem', color: 'rgba(240,246,255,0.4)', marginBottom: 4 }}>🌍 Top Country</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>United States · 68%</div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-bar">
        <div className="stats-bar__inner">
          {[
            { end: 1200000, suffix: '+', label: 'Links Shortened' },
            { end: 85000000, suffix: '+', label: 'Clicks Tracked' },
            { end: 47000, suffix: '+', label: 'Active Users' },
            { end: 99, suffix: '.9%', label: 'Uptime' },
          ].map(s => (
            <div className="stat-cell" key={s.label}>
              <span className="stat-cell__num"><Counter end={s.end} suffix={s.suffix} /></span>
              <div className="stat-cell__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="section-tag">Everything you need</span>
            <h2 className="section-title">Built for <span style={{ background: 'linear-gradient(135deg,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Growth</span></h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Every feature designed to help you understand your audience and maximize link performance.</p>
          </div>
          <div className="features__grid">
            {[
              { icon: '⚡', title: 'Instant Shortening', desc: 'Transform any URL into a clean, memorable short link in milliseconds.' },
              { icon: '🤖', title: 'AI-Powered Insights', desc: 'Claude AI auto-tags links, suggests smart aliases, and generates actionable insights.' },
              { icon: '📊', title: 'Real-Time Analytics', desc: 'Track clicks, devices, browsers, and referrers with live interactive charts.' },
              { icon: '🌍', title: 'Geographic Tracking', desc: 'See exactly where your audience is on an interactive world map.' },
              { icon: '🔒', title: 'Password Protection', desc: 'Secure sensitive links with password gates. Only authorized users get access.' },
              { icon: '📱', title: 'QR Code Generator', desc: 'Every link gets a high-quality QR code, perfect for print and offline campaigns.' },
              { icon: '⏱', title: 'Link Expiry', desc: 'Set automatic expiry dates. Perfect for time-limited campaigns and offers.' },
              { icon: '🎯', title: 'Custom Aliases', desc: 'Create branded short links with your own custom slugs.' },
              { icon: '🔗', title: 'Bulk Management', desc: 'Manage all your links from one dashboard with search and instant delete.' },
            ].map(f => (
              <div className="feat-cell" key={f.title}>
                <span className="feat-icon">{f.icon}</span>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS SHOWCASE ── */}
      <section className="showcase" id="analytics">
        <div className="showcase__inner">
          <div>
            <span className="section-tag">Deep Analytics</span>
            <h2 className="section-title">Know Your <span style={{ background: 'linear-gradient(135deg,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Audience</span> Inside Out</h2>
            <p className="section-sub" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              Every click tells a story. LinkSnap captures device types, browsers, geographic locations, and peak hours — all visualized in real time.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                '📈 30-day click timeline with trends',
                '🌍 Geographic map with country breakdown',
                '💻 Device, browser & OS analytics',
                '📌 Top referrer sources tracking',
                '⏰ Peak hour engagement detection',
                '🤖 AI bot risk detection & spam alerts',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: 'rgba(240,246,255,0.55)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, display: 'inline-block' }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="cta-primary" style={{ display: 'inline-flex', marginTop: '2rem' }}>Try Analytics Free →</Link>
          </div>

          <div className="analytics-card">
            <div className="analytics-card__header">
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--faint)', fontFamily: 'monospace' }}>lnksnp.io/product-v2</div>
                <div className="analytics-card__title">Link Analytics</div>
              </div>
              <div className="live-badge"><div className="live-dot" /> Live</div>
            </div>
            <div className="chart-bars">
              {[30,55,40,70,45,90,65,80,50,75,95,60,85,100].map((h, i) => (
                <div className="chart-bar" key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="analytics-stats">
              {[
                { val: '12,483', label: 'Total Clicks', color: '#f0f6ff' },
                { val: '3,291', label: 'Last 7 Days', color: '#7dd3fc' },
                { val: '3PM UTC', label: 'Peak Hour', color: '#a78bfa' },
              ].map(s => (
                <div className="analytics-stat" key={s.label}>
                  <div className="analytics-stat__val" style={{ color: s.color }}>{s.val}</div>
                  <div className="analytics-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="country-list">
              {[
                { name: '🇺🇸 United States', pct: 68 },
                { name: '🇮🇳 India', pct: 14 },
                { name: '🇬🇧 United Kingdom', pct: 9 },
              ].map(c => (
                <div className="country-row" key={c.name}>
                  <div className="country-name">{c.name}</div>
                  <div className="country-bar-bg"><div className="country-bar-fill" style={{ width: `${c.pct}%` }} /></div>
                  <div className="country-pct">{c.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REAL WORLD USE CASES ── */}
      <section className="real-world">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span className="section-tag">Use Cases</span>
            <h2 className="section-title">Built for Every <span style={{ background: 'linear-gradient(135deg,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creator</span></h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>From marketers to developers — LinkSnap fits every workflow.</p>
          </div>
          <div className="image-grid">
            {[
              {
                src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
                label: 'Marketing Campaigns',
                sub: 'Track conversions in real-time',
              },
              {
                src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
                label: 'Social Media Growth',
                sub: 'See what content drives clicks',
              },
              {
                src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
                label: 'Developer Tools',
                sub: 'API access & custom integrations',
              },
            ].map(card => (
              <div className="image-card" key={card.label}>
                <img src={card.src} alt={card.label} loading="lazy" />
                <div className="image-card__overlay">
                  <div>
                    <div className="image-card__label">{card.label}</div>
                    <div className="image-card__sub">{card.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <div className="how__inner">
          <div style={{ textAlign: 'center' }}>
            <span className="section-tag">Simple as 1-2-3</span>
            <h2 className="section-title">Up in <span style={{ background: 'linear-gradient(135deg,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>30 Seconds</span></h2>
          </div>
          <div className="steps">
            {[
              { num: '01', icon: '📋', title: 'Paste Your URL', desc: 'Drop any long URL into LinkSnap — website, document, video, anything.' },
              { num: '02', icon: '✨', title: 'AI Enhances It', desc: 'Claude AI auto-tags your link, suggests a smart alias, and prepares analytics.' },
              { num: '03', icon: '🚀', title: 'Share & Track', desc: 'Share your short link anywhere and watch real-time analytics roll in.' },
            ].map(s => (
              <div className="step" key={s.num}>
                <div className="step__num">{s.num}</div>
                <span className="step__icon">{s.icon}</span>
                <div className="step__title">{s.title}</div>
                <div className="step__desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="pricing">
        <div className="cta-box">
          <div className="cta-box__eyebrow">🎉 Free Forever Plan Available</div>
          <h2 className="cta-box__title">Start Snapping<br />Links Today</h2>
          <p className="cta-box__sub">No credit card. No limits on basic usage. Just powerful link management from day one.</p>
          <div className="cta-box__buttons">
            <Link to="/register" className="cta-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>Create Free Account →</Link>
            <Link to="/login" className="cta-secondary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(240,246,255,0.5)' }}>LinkSnap</span>
          </div>
          <p className="copy">© 2026 LinkSnap. Built with ❤️ and AI.</p>
          <div className="links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}