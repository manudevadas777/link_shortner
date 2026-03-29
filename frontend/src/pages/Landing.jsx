import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ── Animated canvas background ─────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const particles = [];
    const PARTICLE_COUNT = 80;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(12,141,238,${p.a})`;
        ctx.fill();

        // Draw lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(12,141,238,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Animated counter ───────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Feature card ───────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div
      className="glass-card-hover p-6 group relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow blob on hover */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ background: color }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Floating mockup card ───────────────────────────────────────────
function FloatingCard({ style, children }) {
  return (
    <div
      className="absolute glass-card p-3 rounded-xl border border-white/10 shadow-2xl"
      style={{ ...style, backdropFilter: 'blur(20px)' }}
    >
      {children}
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(7,11,21,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(12,141,238,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="font-bold text-lg gradient-text">LinkSnap</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Analytics', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main Landing Page ──────────────────────────────────────────────
export default function Landing() {
  const [url, setUrl] = useState('');
  const [demoShort, setDemoShort] = useState('');

  const handleDemoShorten = (e) => {
    e.preventDefault();
    if (!url) return;
    const fake = 'lnksnp.io/' + Math.random().toString(36).slice(2, 8);
    setDemoShort(fake);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#070b15' }}>
      <ParticleCanvas />

      {/* Extra radial blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(ellipse at center, rgba(12,141,238,0.18) 0%, transparent 70%)' }} />
      </div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      </div>

      <div className="relative" style={{ zIndex: 2 }}>
        <LandingNav />

        {/* ── HERO ── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-semibold mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            AI-Powered URL Shortener
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-6 animate-slide-up text-balance max-w-5xl">
            Shorten Links.{' '}
            <span className="gradient-text">Amplify Reach.</span>
            <br />Track Everything.
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mb-10 animate-fade-in leading-relaxed">
            LinkSnap transforms your long URLs into powerful branded links with real-time analytics, AI insights, QR codes, and geographic click tracking — all in one sleek dashboard.
          </p>

          {/* Demo shortener */}
          <form
            onSubmit={handleDemoShorten}
            className="w-full max-w-xl mb-6 animate-slide-up"
          >
            <div className="relative flex items-center">
              <div className="absolute left-4 text-white/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Paste your long URL to preview…"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full pl-10 pr-36 py-4 rounded-2xl text-sm outline-none text-white placeholder-white/25 font-mono"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 40px rgba(12,141,238,0.08)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(12,141,238,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="submit"
                className="absolute right-2 btn-primary text-sm px-5 py-2"
              >
                Shorten →
              </button>
            </div>
            {demoShort && (
              <div className="mt-3 flex items-center justify-center gap-3 animate-fade-in">
                <span className="text-brand-400 font-mono text-sm font-bold">{demoShort}</span>
                <span className="text-white/20 text-xs">✓ Ready to use after signup</span>
              </div>
            )}
          </form>

          {/* CTA buttons */}
          <div className="flex items-center gap-4 animate-fade-in">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
              Start for Free
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
              Sign In
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-6 text-white/20 text-xs animate-fade-in">
            No credit card required · Free forever plan · Setup in 30 seconds
          </p>

          {/* Floating UI mockups */}
          <div className="relative w-full max-w-4xl h-64 mt-20 hidden md:block">
            <FloatingCard style={{ left: '0%', top: '0', animationDelay: '0s' }}>
              <div className="flex items-center gap-3 animate-float">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">✓</div>
                <div>
                  <p className="text-xs font-semibold text-white">Link Created!</p>
                  <p className="text-xs text-brand-400 font-mono">lnksnp.io/ai-docs</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard style={{ right: '0%', top: '20px', animationDelay: '1s' }}>
              <div className="animate-float" style={{ animationDelay: '1s' }}>
                <p className="text-xs text-white/40 mb-1">Total Clicks Today</p>
                <p className="text-2xl font-bold text-brand-400">2,847</p>
                <p className="text-xs text-emerald-400">↑ 24% from yesterday</p>
              </div>
            </FloatingCard>

            <FloatingCard style={{ left: '30%', bottom: '0', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-lg">🌍</span>
                <div>
                  <p className="text-xs text-white/40">Top Country</p>
                  <p className="text-sm font-semibold text-white">United States · 68%</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard style={{ left: '55%', top: '10px', animationDelay: '1.5s' }}>
              <div className="animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🤖</span>
                  <p className="text-xs text-accent-400 font-semibold">AI Tag: E-Commerce</p>
                </div>
                <p className="text-xs text-white/30">Smart alias suggested</p>
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-20 px-6" id="stats">
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-3xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {[
                { value: 1200000, suffix: '+', label: 'Links Shortened', color: 'text-brand-400' },
                { value: 85000000, suffix: '+', label: 'Total Clicks Tracked', color: 'text-accent-400' },
                { value: 47000, suffix: '+', label: 'Active Users', color: 'text-emerald-400' },
                { value: 99.9, suffix: '%', label: 'Uptime', color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-3xl sm:text-4xl font-black mb-1 ${s.color}`}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 px-6" id="features">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3 block">Everything you need</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Built for <span className="gradient-text">Growth</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                Every feature designed to help you understand your audience and maximize link performance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '⚡', title: 'Instant Shortening', desc: 'Transform any URL into a clean, memorable short link in milliseconds with our lightning-fast engine.', color: '#f59e0b', delay: 0 },
                { icon: '🤖', title: 'AI-Powered Insights', desc: 'Claude AI automatically tags your links, suggests smart aliases, and generates actionable performance insights.', color: '#8b5cf6', delay: 100 },
                { icon: '📊', title: 'Real-Time Analytics', desc: 'Track clicks, devices, browsers, locations, and referrers with beautiful interactive charts updated live.', color: '#0c8dee', delay: 200 },
                { icon: '🌍', title: 'Geographic Tracking', desc: 'See exactly where your audience is with an interactive world map showing clicks by country and city.', color: '#10b981', delay: 300 },
                { icon: '🔒', title: 'Password Protection', desc: 'Secure sensitive links with password protection. Only people with the password can access the destination.', color: '#f43f5e', delay: 400 },
                { icon: '⏱', title: 'Link Expiry', desc: 'Set automatic expiry dates on links. Perfect for time-limited campaigns and promotional offers.', color: '#f97316', delay: 500 },
                { icon: '📱', title: 'QR Code Generator', desc: 'Every short link comes with a high-quality QR code, perfect for print materials and offline campaigns.', color: '#06b6d4', delay: 600 },
                { icon: '🎯', title: 'Custom Aliases', desc: 'Create branded short links with your own custom slugs like lnksnp.io/my-launch instead of random codes.', color: '#8b5cf6', delay: 700 },
                { icon: '🔗', title: 'Bulk Management', desc: 'Manage all your links from one dashboard. Search, filter, and delete links with a single click.', color: '#0c8dee', delay: 800 },
              ].map(f => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── ANALYTICS SHOWCASE ── */}
        <section className="py-20 px-6" id="analytics">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 mb-3 block">Deep Analytics</span>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                  Know Your{' '}
                  <span className="gradient-text">Audience</span>
                  <br />Inside Out
                </h2>
                <p className="text-white/40 text-base leading-relaxed mb-8">
                  Every click tells a story. LinkSnap captures device types, browsers, operating systems, geographic locations, referrers, and peak engagement hours — all visualized in real time.
                </p>
                <ul className="space-y-3">
                  {[
                    '📈 30-day click timeline with trends',
                    '🌍 Geographic map with country & city breakdown',
                    '💻 Device, browser & OS analytics',
                    '📌 Top referrer sources tracking',
                    '⏰ Peak hour engagement detection',
                    '🤖 AI bot risk detection & spam alerts',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary mt-10 inline-flex">
                  Try Analytics Free →
                </Link>
              </div>

              {/* Fake analytics card */}
              <div className="relative">
                <div
                  className="rounded-3xl p-6 space-y-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(12,141,238,0.08)',
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/30">lnksnp.io/product-v2</p>
                      <p className="text-xl font-bold text-white mt-0.5">Link Analytics</p>
                    </div>
                    <span className="badge-green">● Live</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Clicks', val: '12,483', color: 'text-white' },
                      { label: 'Last 7 Days', val: '3,291', color: 'text-brand-400' },
                      { label: 'Peak Hour', val: '3:00 UTC', color: 'text-accent-400' },
                    ].map(s => (
                      <div key={s.label} className="stat-card text-center p-3">
                        <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
                        <span className="text-xs text-white/30">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fake bar chart */}
                  <div>
                    <p className="section-title">Clicks Over Time</p>
                    <div className="flex items-end gap-1 h-24">
                      {[30, 55, 40, 70, 45, 90, 65, 80, 50, 75, 95, 60, 85, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm transition-all duration-700"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, #0c8dee, #39a8ff)`,
                            opacity: 0.3 + (h / 200),
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Country list */}
                  <div>
                    <p className="section-title">Top Countries</p>
                    <div className="space-y-2">
                      {[
                        { country: '🇺🇸 United States', pct: 68 },
                        { country: '🇮🇳 India', pct: 14 },
                        { country: '🇬🇧 United Kingdom', pct: 9 },
                      ].map(c => (
                        <div key={c.country} className="flex items-center gap-3">
                          <span className="text-xs text-white/50 w-36">{c.country}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${c.pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/30 w-8 text-right">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glow behind card */}
                <div className="absolute inset-0 rounded-3xl -z-10 blur-3xl opacity-20"
                  style={{ background: 'linear-gradient(135deg, #0c8dee, #8b5cf6)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3 block">Simple as 1-2-3</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-16">
              Up in <span className="gradient-text">30 Seconds</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: '📋', title: 'Paste Your URL', desc: 'Drop any long URL into LinkSnap — website, document, video, social post, anything.' },
                { step: '02', icon: '✨', title: 'AI Enhances It', desc: 'Our AI auto-tags your link, suggests a smart alias, and prepares analytics tracking.' },
                { step: '03', icon: '🚀', title: 'Share & Track', desc: 'Share your short link anywhere and watch real-time analytics roll in from around the world.' },
              ].map((s) => (
                <div key={s.step} className="relative">
                  <div className="absolute -top-3 -left-3 text-xs font-black text-brand-500/30 text-6xl font-mono leading-none select-none">
                    {s.step}
                  </div>
                  <div className="glass-card p-6 pt-8 relative">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6" id="pricing">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="rounded-3xl p-12 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(12,141,238,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                border: '1px solid rgba(12,141,238,0.25)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Background blobs */}
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-30"
                style={{ background: '#0c8dee' }} />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-20"
                style={{ background: '#8b5cf6' }} />

              <div className="relative">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-semibold mb-6">
                  🎉 Free Forever Plan Available
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                  Start Snapping Links Today
                </h2>
                <p className="text-white/50 text-lg mb-10">
                  No credit card. No limits on basic usage. Just powerful link management from day one.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link to="/register" className="btn-primary px-10 py-4 text-base">
                    Create Free Account →
                  </Link>
                  <Link to="/login" className="btn-secondary px-10 py-4 text-base">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/[0.05] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span className="font-bold text-sm text-white/60">LinkSnap</span>
            </div>
            <p className="text-xs text-white/20">© 2026 LinkSnap. Built with ❤️ and AI.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">Sign In</Link>
              <Link to="/register" className="text-xs text-white/30 hover:text-white/60 transition-colors">Sign Up</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
