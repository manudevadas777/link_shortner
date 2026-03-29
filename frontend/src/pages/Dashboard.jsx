import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(12,141,238,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="font-bold text-lg gradient-text">LinkSnap</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40 hidden sm:block">
            {user?.name}
          </span>
          <button onClick={onLogout} className="btn-ghost text-white/40 hover:text-red-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── QR Modal ────────────────────────────────────────────────────────
function QRModal({ link, onClose }) {
  if (!link) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass-card p-8 relative z-10 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost text-white/40">✕</button>
        <h3 className="font-bold text-lg mb-1 text-white">QR Code</h3>
        <p className="text-xs text-white/30 mb-6 font-mono break-all">{link.shortUrl}</p>
        <div className="bg-white rounded-xl p-4 mx-auto w-fit">
          <QRCodeSVG value={link.shortUrl} size={180} />
        </div>
        <p className="text-xs text-white/30 text-center mt-4">Scan to open link</p>
      </div>
    </div>
  );
}

// ── Create Link Form ─────────────────────────────────────────────────
function CreateLinkForm({ onCreated }) {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', password: '', expiresAt: '', useAI: true });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.customAlias) delete payload.customAlias;
      if (!payload.password) delete payload.password;
      if (!payload.expiresAt) delete payload.expiresAt;
      const { data } = await api.post('/links', payload);
      onCreated(data);
      setForm({ originalUrl: '', customAlias: '', password: '', expiresAt: '', useAI: true });
      setExpanded(false);
      toast.success('Link created! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39a8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h2 className="font-semibold text-white">Create Short Link</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input id="create-url" type="url" className="input flex-1" placeholder="Paste your long URL here…" value={form.originalUrl}
            onChange={e => setForm({ ...form, originalUrl: e.target.value })} required />
          <button id="create-submit" type="submit" disabled={loading} className="btn-primary shrink-0">
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Shorten →'}
          </button>
        </div>

        {/* Advanced Options Toggle */}
        <button type="button" onClick={() => setExpanded(!expanded)} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Advanced options
        </button>

        {expanded && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2 animate-fade-in">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Custom Alias</label>
              <input id="create-alias" type="text" className="input" placeholder="e.g. my-project" value={form.customAlias}
                onChange={e => setForm({ ...form, customAlias: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Password Protect</label>
              <input id="create-password" type="password" className="input" placeholder="Optional password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Expiry Date</label>
              <input id="create-expiry" type="datetime-local" className="input" value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button type="button" id="create-ai-toggle"
                onClick={() => setForm({ ...form, useAI: !form.useAI })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.useAI ? 'bg-brand-500' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${form.useAI ? 'left-5' : 'left-0.5'}`} />
              </button>
              <label className="text-xs text-white/50 cursor-pointer" onClick={() => setForm({ ...form, useAI: !form.useAI })}>
                AI auto-tag & smart alias
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ── Link Card ────────────────────────────────────────────────────────
// ── Link Card ────────────────────────────────────────────────────────
function LinkCard({ link, onDelete, onQR }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tagColors = {
    'Blog': 'badge-blue', 'E-Commerce': 'badge-green', 'Social Media': 'badge-purple',
    'News': 'badge-yellow', 'Video': 'badge-red', 'Other': 'badge-blue',
    'Documentation': 'badge-blue', 'Portfolio': 'badge-purple', 'Tool': 'badge-green',
    'Event': 'badge-yellow',
  };

  return (
    <div className="glass-card-hover p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* ✅ Clickable short URL — opens in new tab */}
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-brand-400 text-sm font-semibold hover:text-brand-300 hover:underline transition-colors"
            >
              {link.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            {link.tag && <span className={tagColors[link.tag] || 'badge-blue'}>{link.tag}</span>}
            {link.expiresAt && <span className="badge-yellow">⏱ Expires {new Date(link.expiresAt).toLocaleDateString()}</span>}
            {link.password && <span className="badge-purple">🔒 Protected</span>}
          </div>
          <p className="text-xs text-white/30 truncate">{link.originalUrl}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-white/40 font-mono">{link.clickCount} clicks</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <button onClick={copy} id={`copy-${link.id}`} className="btn-secondary text-xs px-3 py-1.5">
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
        {/* ✅ Also a direct open button */}
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs px-3 py-1.5"
        >
          🔗 Open Link
        </a>
        <Link to={`/analytics/${link.id}`} id={`analytics-${link.id}`} className="btn-secondary text-xs px-3 py-1.5">
          📊 Analytics
        </Link>
        <button onClick={() => onQR(link)} id={`qr-${link.id}`} className="btn-secondary text-xs px-3 py-1.5">
          QR Code
        </button>
        <button onClick={() => onDelete(link.id)} id={`delete-${link.id}`} className="btn-danger text-xs px-3 py-1.5 ml-auto">
          Delete
        </button>
      </div>
    </div>
  );
}
// ── Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrLink, setQrLink] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data } = await api.get('/links');
      setLinks(data);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (newLink) => {
    setLinks(prev => [newLink, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this link? This cannot be undone.')) return;
    try {
      await api.delete(`/links/${id}`);
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete link');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalClicks = links.reduce((s, l) => s + (l.clickCount || 0), 0);
  const filteredLinks = links.filter(l =>
    l.shortCode.includes(search) || l.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <QRModal link={qrLink} onClose={() => setQrLink(null)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-1">
            Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 text-sm">Manage and track all your shortened links.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="stat-card text-center">
            <span className="text-2xl font-bold text-white">{links.length}</span>
            <span className="text-xs text-white/30">Total Links</span>
          </div>
          <div className="stat-card text-center">
            <span className="text-2xl font-bold text-brand-400">{totalClicks.toLocaleString()}</span>
            <span className="text-xs text-white/30">Total Clicks</span>
          </div>
          <div className="stat-card text-center">
            <span className="text-2xl font-bold text-accent-400">
              {links.length ? Math.round(totalClicks / links.length) : 0}
            </span>
            <span className="text-xs text-white/30">Avg Clicks</span>
          </div>
        </div>

        {/* Create form */}
        <div className="animate-slide-up">
          <CreateLinkForm onCreated={handleCreated} />
        </div>

        {/* Link list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="section-title m-0">Your Links ({filteredLinks.length})</span>
            <input type="text" placeholder="Search links…" className="input w-52 py-1.5 text-xs"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 w-full" />)}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-3">🔗</p>
              <p className="text-white/40 text-sm">
                {search ? 'No links match your search.' : 'Paste a URL above to create your first short link.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {filteredLinks.map(link => (
                <LinkCard key={link.id} link={link} onDelete={handleDelete} onQR={setQrLink} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
