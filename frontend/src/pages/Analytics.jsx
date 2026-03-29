import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../api/client';

// Country → rough lat/lng lookup (top 30 countries)
const COUNTRY_COORDS = {
  US: [37.09, -95.71], GB: [55.38, -3.44], IN: [20.59, 78.96], DE: [51.17, 10.45],
  FR: [46.23, 2.21], CA: [56.13, -106.35], AU: [-25.27, 133.78], BR: [-14.24, -51.93],
  CN: [35.86, 104.20], JP: [36.20, 138.25], KR: [35.91, 127.77], RU: [61.52, 105.32],
  MX: [23.63, -102.55], IT: [41.87, 12.57], ES: [40.46, -3.75], NL: [52.13, 5.29],
  SE: [60.13, 18.64], NO: [60.47, 8.47], DK: [56.26, 9.50], FI: [61.92, 25.75],
  PL: [51.92, 19.15], TR: [38.96, 35.24], ZA: [-30.56, 22.94], NG: [9.08, 8.68],
  SG: [1.35, 103.82], PK: [30.38, 69.35], ID: [-0.79, 113.92], PH: [12.88, 121.77],
  AR: [-38.42, -63.62], EG: [26.82, 30.80],
};

const CHART_COLORS = ['#0c8dee', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.value} {p.name}</p>
      ))}
    </div>
  );
};

// ── Analytics Page ────────────────────────────────────────────────
export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get(`/analytics/${id}`);
        setData(res);
      } catch {
        toast.error('Failed to load analytics');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  const { link, analytics } = data;
  const mapMarkers = analytics.countryBreakdown
    .filter(c => COUNTRY_COORDS[c.name])
    .map(c => ({ ...c, coords: COUNTRY_COORDS[c.name] }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.05] bg-surface-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="btn-ghost text-white/40 pl-0">
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="font-mono text-brand-400 text-sm">/{link.shortCode}</span>
          {link.tag && <span className="badge-blue hidden sm:inline-flex">{link.tag}</span>}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Link info */}
        <div className="glass-card p-5 mb-6">
          <p className="text-xs text-white/30 mb-1">Original URL</p>
          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors break-all">
            {link.originalUrl}
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Clicks', value: analytics.total, color: 'text-white' },
            { label: 'Last 7 Days', value: analytics.last7Days, color: 'text-brand-400' },
            { label: 'Top Device', value: analytics.deviceBreakdown[0]?.name || '—', color: 'text-white' },
            { label: 'Peak Hour', value: analytics.peakHour || '—', color: 'text-accent-400' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-white/30">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column — charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clicks over time */}
            <div className="glass-card p-6">
              <p className="section-title">Clicks Over Time (30 Days)</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.clicksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                    tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="clicks" stroke="#0c8dee" strokeWidth={2}
                    dot={false} activeDot={{ r: 4, fill: '#0c8dee' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Devices + Browsers */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <p className="section-title">Device Breakdown</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={analytics.deviceBreakdown} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {analytics.deviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <p className="section-title">Top Browsers</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.browserBreakdown.slice(0, 5)} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="clicks" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Countries */}
            <div className="glass-card p-6">
              <p className="section-title">Top Countries</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.countryBreakdown.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Referrers */}
            {analytics.referrerBreakdown.length > 0 && (
              <div className="glass-card p-6">
                <p className="section-title">Top Referrers</p>
                <div className="space-y-2">
                  {analytics.referrerBreakdown.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate">{r.name || 'Direct'}</p>
                        <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(r.value / analytics.referrerBreakdown[0].value) * 100}%`, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                      <span className="text-xs text-white/40 shrink-0 font-mono">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* World Map */}
            <div className="glass-card p-6">
              <p className="section-title">Click Map</p>
              <div className="rounded-xl overflow-hidden h-64">
                <MapContainer center={[20, 0]} zoom={1.5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {mapMarkers.map((m, i) => (
                    <CircleMarker key={i} center={m.coords}
                      radius={Math.max(6, Math.min(20, m.value * 1.5))}
                      pathOptions={{ color: '#0c8dee', fillColor: '#0c8dee', fillOpacity: 0.6 }}>
                      <Popup><span className="text-black font-semibold">{m.name}: {m.value} clicks</span></Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* OS Breakdown */}
            <div className="glass-card p-5">
              <p className="section-title">Operating Systems</p>
              <div className="space-y-2">
                {analytics.osBreakdown.slice(0, 5).map((os, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{os.name}</span>
                    <span className="text-white/30 font-mono">{os.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            {analytics.cityBreakdown.length > 0 && (
              <div className="glass-card p-5">
                <p className="section-title">Top Cities</p>
                <div className="space-y-2">
                  {analytics.cityBreakdown.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-white/50">{c.name}</span>
                      <span className="text-white/30 font-mono">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}