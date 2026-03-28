import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Protected() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const backendBase = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:4000';
      window.location.href = `${backendBase}/${shortCode}?pw=${encodeURIComponent(password)}`;
    } catch {
      toast.error('Incorrect password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/20 border border-accent-500/30 text-3xl mb-4 animate-float">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password Required</h1>
          <p className="text-sm text-white/40">
            This link is password protected. Enter the password to continue.
          </p>
          <p className="mt-2 font-mono text-xs text-brand-400">/{shortCode}</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="protected-password"
              type="password"
              className="input"
              placeholder="Enter password…"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
            <button id="protected-submit" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Checking…
                </span>
              ) : 'Unlock Link →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
