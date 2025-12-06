import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, Home, Flame, Users as UsersIcon, Mail, Settings, Shield, 
  Plus, Trash2, Play, Pause, Upload, Search, Send, Eye, Clock,
  RefreshCw, X, Copy, Check, FileText, BarChart2, TrendingUp,
  ChevronRight, Edit2, MousePointer, Reply, AlertTriangle,
  Calendar, Zap, Target, ArrowUp, ArrowDown, Minus,
  Globe, Server, Lock, Link2, ExternalLink, CheckCircle, XCircle
} from 'lucide-react';
import { AuthProvider, useAuth, LoginPage, UserManagement, LogoutButton } from './AuthComponents';

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = 'https://cold-email-system-1.onrender.com';

async function apiCall(endpoint, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

function AppContent() {
  const { user, loading, isAdmin, getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}><div style={{ color: 'white', fontSize: '20px' }}>Loading...</div></div>;
  if (!user) return <LoginPage />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} isAdmin={isAdmin} user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar setSidebarOpen={setSidebarOpen} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <PageContent page={currentPage} showNotification={showNotification} getToken={getToken} setCurrentPage={setCurrentPage} />
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// NOTIFICATION
// =============================================================================

function Notification({ message, type, onClose }) {
  const colors = { success: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: Check }, error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: X }, warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: AlertTriangle }, info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: Zap } };
  const c = colors[type] || colors.info;
  const Icon = c.icon;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 9999, maxWidth: 400 }}>
      <Icon size={20} color={c.text} /><span style={{ color: c.text, fontSize: 14, fontWeight: 500, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: c.text }}><X size={16} /></button>
    </div>
  );
}

// =============================================================================
// PAGE ROUTER
// =============================================================================

function PageContent({ page, showNotification, getToken, setCurrentPage }) {
  const props = { getToken, showNotification, setCurrentPage };
  switch (page) {
    case 'dashboard': return <Dashboard {...props} />;
    case 'analytics': return <AnalyticsPage {...props} />;
    case 'warming': return <WarmingPage {...props} />;
    case 'contacts': return <ContactsPage {...props} />;
    case 'templates': return <TemplatesPage {...props} />;
    case 'campaigns': return <CampaignsPage {...props} />;
    case 'sequences': return <SequencesPage {...props} />;
    case 'domains': return <DomainsPage {...props} />;
    case 'settings': return <SettingsPage {...props} />;
    case 'users': return <UserManagement />;
    default: return <Dashboard {...props} />;
  }
}

// =============================================================================
// SIDEBAR
// =============================================================================

function Sidebar({ currentPage, setCurrentPage, sidebarOpen, isAdmin, user }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'warming', icon: Flame, label: 'Warming' },
    { id: 'contacts', icon: UsersIcon, label: 'Contacts' },
    { id: 'templates', icon: FileText, label: 'Templates' },
    { id: 'campaigns', icon: Mail, label: 'Campaigns' },
    { id: 'sequences', icon: Zap, label: 'Sequences' },
    { id: 'domains', icon: Globe, label: 'Domains' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'users', icon: Shield, label: 'Users', adminOnly: true },
  ];
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin());
  if (!sidebarOpen) return null;

  return (
    <div style={{ width: 260, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Mail size={20} color="white" /></div>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>Cold Email Pro</span>
      </div>
      <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 4, background: isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent', color: isActive ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
              <Icon size={20} /><span>{item.label}</span>
              {item.adminOnly && <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 10, background: isActive ? 'rgba(255,255,255,0.2)' : '#ede9fe', color: isActive ? 'white' : '#7c3aed' }}>Admin</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#111827' }}>{user.name}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{user.email}</p>
          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: user.role === 'admin' ? '#ede9fe' : '#f3f4f6', color: user.role === 'admin' ? '#7c3aed' : '#6b7280' }}>{user.role}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOP BAR
// =============================================================================

function TopBar({ setSidebarOpen }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const fetch = async () => { try { const res = await window.fetch(`${API_BASE_URL}/health`); if (res.ok) setStatus(await res.json()); } catch { setStatus({ status: 'error' }); } };
    fetch(); const i = setInterval(fetch, 30000); return () => clearInterval(i);
  }, []);

  return (
    <div style={{ height: 64, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
      <button onClick={() => setSidebarOpen(p => !p)} style={{ padding: 8, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', color: '#6b7280' }}><Menu size={20} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {status && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: status.status === 'ok' ? '#d1fae5' : '#fee2e2', borderRadius: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: status.status === 'ok' ? '#10b981' : '#ef4444' }} /><span style={{ fontSize: 13, fontWeight: 500, color: status.status === 'ok' ? '#065f46' : '#991b1b' }}>{status.status === 'ok' ? 'System Online' : 'System Error'}</span></div>}
        <LogoutButton />
      </div>
    </div>
  );
}

// =============================================================================
// DASHBOARD
// =============================================================================

function Dashboard({ getToken, setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => { try { const data = await apiCall('/api/analytics/overview', {}, getToken()); setStats(data.stats); } catch (error) { console.error(error); } finally { setLoading(false); } };
    fetchData();
  }, [getToken]);

  const quickActions = [
    { icon: Flame, title: 'Add Warming Account', page: 'warming', color: '#f59e0b' },
    { icon: Upload, title: 'Import Contacts', page: 'contacts', color: '#10b981' },
    { icon: FileText, title: 'Create Template', page: 'templates', color: '#8b5cf6' },
    { icon: Mail, title: 'New Campaign', page: 'campaigns', color: '#667eea' },
    { icon: Zap, title: 'Create Sequence', page: 'sequences', color: '#ec4899' },
    { icon: Globe, title: 'Buy Domain', page: 'domains', color: '#f97316' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Dashboard</h1><p style={{ color: '#6b7280' }}>Overview of your cold email system</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard icon={UsersIcon} label="Contacts" value={loading ? '...' : stats?.total_contacts || 0} color="#10b981" />
        <StatCard icon={Mail} label="Campaigns" value={loading ? '...' : stats?.total_campaigns || 0} color="#667eea" />
        <StatCard icon={Zap} label="Sequences" value={loading ? '...' : stats?.total_sequences || 0} color="#ec4899" />
        <StatCard icon={Flame} label="Warming Accounts" value={loading ? '...' : stats?.active_warming_accounts || 0} color="#f59e0b" />
        <StatCard icon={Send} label="Emails Sent" value={loading ? '...' : stats?.total_emails_sent || 0} color="#3b82f6" />
        <StatCard icon={Eye} label="Opens" value={loading ? '...' : stats?.total_emails_opened || 0} color="#8b5cf6" />
        <StatCard icon={MousePointer} label="Clicks" value={loading ? '...' : stats?.total_emails_clicked || 0} color="#06b6d4" />
        <StatCard icon={Reply} label="Replies" value={loading ? '...' : stats?.total_emails_replied || 0} color="#84cc16" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {quickActions.map((action, i) => <QuickActionCard key={i} {...action} onClick={() => setCurrentPage(action.page)} />)}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={color} /></div></div>
      <p style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4, color: '#111827' }}>{value}</p><p style={{ fontSize: 13, color: '#6b7280' }}>{label}</p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, color, onClick }) {
  return (
    <div onClick={onClick} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={20} color={color} /></div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</h3>
    </div>
  );
}

// =============================================================================
// ANALYTICS PAGE
// =============================================================================

function AnalyticsPage({ getToken }) {
  const [overview, setOverview] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, dailyRes] = await Promise.all([apiCall('/api/analytics/overview', {}, getToken()), apiCall('/api/analytics/daily?days=14', {}, getToken())]);
        setOverview(overviewRes.stats); setDailyStats(dailyRes.stats || []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [getToken]);

  const openRate = overview?.total_emails_sent > 0 ? ((overview.total_emails_opened / overview.total_emails_sent) * 100).toFixed(1) : 0;
  const clickRate = overview?.total_emails_opened > 0 ? ((overview.total_emails_clicked / overview.total_emails_opened) * 100).toFixed(1) : 0;
  const replyRate = overview?.total_emails_sent > 0 ? ((overview.total_emails_replied / overview.total_emails_sent) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Analytics</h1><p style={{ color: '#6b7280' }}>Track your email performance and engagement</p></div>
      {loading ? <LoadingState message="Loading analytics..." /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <MetricCard label="Open Rate" value={`${openRate}%`} icon={Eye} color="#8b5cf6" trend={openRate > 20 ? 'up' : openRate > 10 ? 'neutral' : 'down'} />
            <MetricCard label="Click Rate" value={`${clickRate}%`} icon={MousePointer} color="#06b6d4" trend={clickRate > 5 ? 'up' : clickRate > 2 ? 'neutral' : 'down'} />
            <MetricCard label="Reply Rate" value={`${replyRate}%`} icon={Reply} color="#10b981" trend={replyRate > 3 ? 'up' : replyRate > 1 ? 'neutral' : 'down'} />
            <MetricCard label="Total Sent" value={overview?.total_emails_sent || 0} icon={Send} color="#3b82f6" />
          </div>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Email Activity (Last 14 Days)</h3>
            <SimpleChart data={dailyStats} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Email Funnel</h3>
              <FunnelItem label="Sent" value={overview?.total_emails_sent || 0} color="#3b82f6" percent={100} />
              <FunnelItem label="Opened" value={overview?.total_emails_opened || 0} color="#8b5cf6" percent={openRate} />
              <FunnelItem label="Clicked" value={overview?.total_emails_clicked || 0} color="#06b6d4" percent={clickRate} />
              <FunnelItem label="Replied" value={overview?.total_emails_replied || 0} color="#10b981" percent={replyRate} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>System Overview</h3>
              <OverviewItem icon={UsersIcon} label="Total Contacts" value={overview?.total_contacts || 0} />
              <OverviewItem icon={Mail} label="Campaigns Created" value={overview?.total_campaigns || 0} />
              <OverviewItem icon={Zap} label="Active Sequences" value={overview?.total_sequences || 0} />
              <OverviewItem icon={Flame} label="Warming Accounts" value={overview?.active_warming_accounts || 0} />
              <OverviewItem icon={AlertTriangle} label="Unsubscribes" value={overview?.total_unsubscribes || 0} color="#ef4444" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, trend }) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={color} /></div>
        {trend && <TrendIcon size={20} color={trendColor} />}
      </div>
      <p style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 4, color: '#111827' }}>{value}</p><p style={{ fontSize: 14, color: '#6b7280' }}>{label}</p>
    </div>
  );
}

function SimpleChart({ data }) {
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No data available yet</div>;
  const maxSent = Math.max(...data.map(d => d.emails_sent || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
      {data.map((day, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <div style={{ width: '80%', height: Math.max(4, (day.emails_sent / maxSent) * 150), background: 'linear-gradient(180deg, #667eea, #764ba2)', borderRadius: 4 }} title={`Sent: ${day.emails_sent}`} />
          </div>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelItem({ label, value, color, percent }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, color: '#374151' }}>{label}</span><span style={{ fontSize: 14, fontWeight: 600 }}>{value} ({percent}%)</span></div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(percent, 100)}%`, background: color, borderRadius: 4 }} /></div>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value, color = '#667eea' }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}><Icon size={18} color={color} /><span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{label}</span><span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{value}</span></div>;
}

// =============================================================================
// WARMING PAGE
// =============================================================================

// =============================================================================
// WARMING PAGE - WITH GMAIL QUICK SETUP
// Replace the existing WarmingPage and AddWarmingAccountModal in App.jsx
// =============================================================================

// =============================================================================
// WARMING CONTROL PANEL
// =============================================================================

function WarmingControlPanel({ getToken, showNotification, domains }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    emailsPerDay: 10,
    aiFrequency: 0.3,
    replyProbability: 0.8
  });

  const fetchStatus = useCallback(async () => {
    try {
      const data = await apiCall('/api/warming/status', {}, getToken());
      setStatus(data);
      if (data.emailsPerDay) {
        setConfig({
          emailsPerDay: data.emailsPerDay,
          aiFrequency: data.aiFrequency || 0.3,
          replyProbability: data.replyProbability || 0.8
        });
      }
    } catch (error) {
      console.error('Failed to fetch warming status:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { 
    fetchStatus(); 
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const verifiedDomains = domains?.filter(d => d.warming_status === 'verified') || [];

  const handleStart = async () => {
    if (verifiedDomains.length === 0) {
      showNotification('Enable warming on at least one domain first (from Domains page)', 'warning');
      return;
    }
    setStarting(true);
    try {
      await apiCall('/api/warming/start', { method: 'POST', body: JSON.stringify(config) }, getToken());
      showNotification('🔥 Warming started!', 'success');
      fetchStatus();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await apiCall('/api/warming/stop', { method: 'POST' }, getToken());
      showNotification('Warming stopped', 'info');
      fetchStatus();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setStopping(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading warming status...</span>
        </div>
      </div>
    );
  }

  const isActive = status?.status === 'active';

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>🔥 Auto Warming</h2>
            <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: isActive ? '#d1fae5' : '#f3f4f6', color: isActive ? '#065f46' : '#6b7280' }}>
              {isActive ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Automatically send emails between your domains to build reputation</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowConfig(!showConfig)} style={secondaryButtonStyle}><Settings size={16} /> Configure</button>
          {isActive ? (
            <button onClick={handleStop} disabled={stopping} style={{ ...secondaryButtonStyle, background: '#fee2e2', color: '#991b1b' }}>
              {stopping ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Pause size={16} />}
              {stopping ? 'Stopping...' : 'Stop Warming'}
            </button>
          ) : (
            <button onClick={handleStart} disabled={starting || verifiedDomains.length === 0} style={primaryButtonStyle}>
              {starting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
              {starting ? 'Starting...' : 'Start Warming'}
            </button>
          )}
        </div>
      </div>

      {verifiedDomains.length === 0 && (
        <div style={{ background: '#fef3c7', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} color="#d97706" />
          <span style={{ color: '#92400e', fontSize: 14 }}>Enable warming on a domain first. Go to <strong>Domains</strong> and click "Enable Warming" on a configured domain.</span>
        </div>
      )}

      {showConfig && (
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Emails per Day</label>
            <input type="range" min="1" max="50" value={config.emailsPerDay} onChange={e => setConfig({ ...config, emailsPerDay: parseInt(e.target.value) })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}><span>1</span><span style={{ fontWeight: 600, color: '#111827' }}>{config.emailsPerDay}</span><span>50</span></div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>AI Response Rate</label>
            <input type="range" min="0" max="100" value={config.aiFrequency * 100} onChange={e => setConfig({ ...config, aiFrequency: parseInt(e.target.value) / 100 })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}><span>Templates</span><span style={{ fontWeight: 600, color: '#111827' }}>{Math.round(config.aiFrequency * 100)}% AI</span><span>Full AI</span></div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Reply Probability</label>
            <input type="range" min="0" max="100" value={config.replyProbability * 100} onChange={e => setConfig({ ...config, replyProbability: parseInt(e.target.value) / 100 })} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}><span>0%</span><span style={{ fontWeight: 600, color: '#111827' }}>{Math.round(config.replyProbability * 100)}%</span><span>100%</span></div>
          </div>
        </div>
      )}

      {status && status.status !== 'not_configured' && status.status !== 'not_initialized' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 4 }}>📤</div><div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{status.emailsSentTotal || 0}</div><div style={{ fontSize: 12, color: '#6b7280' }}>Total Sent</div></div>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 4 }}>🤖</div><div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{status.aiEmailsSent || 0}</div><div style={{ fontSize: 12, color: '#6b7280' }}>AI Generated</div></div>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 4 }}>↩️</div><div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{status.repliesSent || 0}</div><div style={{ fontSize: 12, color: '#6b7280' }}>Auto Replies</div></div>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 4 }}>📅</div><div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{status.emailsPerDay || config.emailsPerDay}</div><div style={{ fontSize: 12, color: '#6b7280' }}>Per Day</div></div>
        </div>
      )}

      {status?.recentEmails && status.recentEmails.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Recent Activity</h3>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {status.recentEmails.slice(0, 5).map((email, i) => (
              <div key={email.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize: 18 }}>{email.is_reply ? '↩️' : '📤'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.sender_email} → {email.recipient_email}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.subject}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {email.is_ai_generated && <span style={{ padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>AI</span>}
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// =============================================================================
// WARMING PAGE (Resend-based)
// =============================================================================

function WarmingPage({ getToken, showNotification }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fixingBounces, setFixingBounces] = useState(null);

  const fetchDomains = useCallback(async () => {
    try { 
      const data = await apiCall('/api/warming/domains', {}, getToken()); 
      setDomains(data.domains || []); 
    } catch (error) { 
      // If no warming domains yet, that's fine
      setDomains([]);
    } finally { 
      setLoading(false); 
    }
  }, [getToken]);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const handleFixBounces = async (domainId) => {
    setFixingBounces(domainId);
    try {
      const result = await apiCall(`/api/domains/${domainId}/fix-bounces`, { method: 'POST' }, getToken());
      showNotification(`✅ ${result.message}`, 'success');
      fetchDomains();
    } catch (error) {
      showNotification(`Failed: ${error.message}`, 'error');
    } finally {
      setFixingBounces(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Email Warming</h1>
          <p style={{ color: '#6b7280' }}>Warm up your domains to improve email deliverability</p>
        </div>
      </div>

      {/* Auto Warming Control Panel */}
      <WarmingControlPanel getToken={getToken} showNotification={showNotification} domains={domains} />

      {/* How It Works */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>🚀 How Resend Warming Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Buy or Import Domain</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Get a domain from the Domains page. Configure DNS.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Enable Warming</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Click "Enable Warming" on your domain. DNS is auto-configured.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Start Warming</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Click Start above. Emails auto-send between your addresses.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warming Domains */}
      {loading ? (
        <LoadingState message="Loading warming domains..." />
      ) : domains.length === 0 ? (
        <EmptyState 
          icon={Flame} 
          title="No Warming Domains" 
          description="Enable warming on a domain to get started. Go to Domains → Click 'Enable Warming' on a configured domain." 
          action={{ label: 'Go to Domains', onClick: () => window.location.hash = '#domains' }} 
        />
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Warming-Enabled Domains</h2>
          {domains.map(domain => (
            <div key={domain.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Globe size={18} color="#667eea" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{domain.domain_name}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: domain.warming_status === 'verified' ? '#d1fae5' : '#fef3c7', color: domain.warming_status === 'verified' ? '#065f46' : '#92400e' }}>
                      {domain.warming_status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Addresses: {domain.addresses?.filter(a => a).join(', ') || 'team@, hello@, contact@, info@'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    onClick={() => handleFixBounces(domain.id)} 
                    disabled={fixingBounces === domain.id}
                    style={{ ...secondaryButtonStyle, padding: '6px 12px', fontSize: 13 }}
                  >
                    {fixingBounces === domain.id ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
                    {fixingBounces === domain.id ? 'Fixing...' : 'Fix Bounces'}
                  </button>
                  {domain.warming_status === 'verified' && (
                    <span style={{ padding: '6px 12px', background: '#d1fae5', color: '#065f46', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                      Ready to warm 🔥
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benefits Section */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, padding: 24, marginTop: 24, color: 'white' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>✨ Why Resend-Based Warming?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>No SMTP passwords needed</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>Automatic DNS setup</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>Works with any domain</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>AI-powered responses</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>Natural conversation threads</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} /><span>3,000 emails/mo free</span></div>
        </div>
      </div>
    </div>
  );
}

// Quick Setup Card Component
function QuickSetupCard({ provider, icon, color, description, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        background: 'white', 
        borderRadius: 12, 
        border: '2px solid #e5e7eb', 
        padding: 20, 
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{provider}</h3>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{description}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 13, fontWeight: 500 }}>
        Quick Setup <ChevronRight size={14} />
      </div>
    </div>
  );
}

// Gmail Setup Guide Modal
function GmailSetupGuideModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal title="Gmail App Password Setup" onClose={onClose} width={600}>
      <div style={{ lineHeight: 1.7 }}>
        <div style={{ background: '#fef3c7', borderRadius: 8, padding: 16, marginBottom: 24, display: 'flex', gap: 12 }}>
          <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, color: '#92400e' }}>
            <strong>Important:</strong> Gmail requires an "App Password" — your regular password won't work.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StepItem 
            number={1} 
            title="Enable 2-Factor Authentication"
            description="If not already enabled, go to your Google Account security settings."
          >
            <a 
              href="https://myaccount.google.com/security" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#667eea', fontSize: 14, marginTop: 8 }}
            >
              Open Google Security Settings <ExternalLink size={14} />
            </a>
          </StepItem>

          <StepItem 
            number={2} 
            title="Go to App Passwords"
            description="Search for 'App Passwords' in your Google Account, or use the direct link below."
          >
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <a 
                href="https://myaccount.google.com/apppasswords" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#667eea', fontSize: 14 }}
              >
                Open App Passwords <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => copyLink('https://myaccount.google.com/apppasswords')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </StepItem>

          <StepItem 
            number={3} 
            title="Create App Password"
            description='Enter a name like "Cold Email Tool" and click Create.'
          />

          <StepItem 
            number={4} 
            title="Copy the 16-character password"
            description="Google will show a 16-character password (like 'abcd efgh ijkl mnop'). Copy it without spaces."
          />

          <StepItem 
            number={5} 
            title="Use it in this app"
            description="Paste the App Password in the SMTP Password field when adding your Gmail account."
          />
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 16, marginTop: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Gmail SMTP Settings (auto-filled for you)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: '#4b5563' }}>
            <div><strong>SMTP Host:</strong> smtp.gmail.com</div>
            <div><strong>SMTP Port:</strong> 587</div>
            <div><strong>IMAP Host:</strong> imap.gmail.com</div>
            <div><strong>IMAP Port:</strong> 993</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onClose} style={primaryButtonStyle}>Got it!</button>
        </div>
      </div>
    </Modal>
  );
}

// Step Item Component for Guide
function StepItem({ number, title, description, children }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: '50%', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 'bold',
        fontSize: 14,
        flexShrink: 0
      }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{description}</p>
        {children}
      </div>
    </div>
  );
}

// Updated Add Warming Account Modal with Quick Fill
function AddWarmingAccountModal({ onClose, onSuccess, getToken, showNotification }) {
  const [form, setForm] = useState({ 
    email: '', 
    smtp_host: '', 
    smtp_port: 587, 
    smtp_user: '', 
    smtp_pass: '', 
    imap_host: '', 
    imap_port: 993 
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  // Preset configurations
  const presets = {
    gmail: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      imap_host: 'imap.gmail.com',
      imap_port: 993
    },
    outlook: {
      smtp_host: 'smtp.office365.com',
      smtp_port: 587,
      imap_host: 'outlook.office365.com',
      imap_port: 993
    }
  };

  // Listen for prefill events
  useEffect(() => {
    const handleGmail = () => { applyPreset('gmail'); };
    const handleOutlook = () => { applyPreset('outlook'); };
    
    window.addEventListener('prefill-gmail', handleGmail);
    window.addEventListener('prefill-outlook', handleOutlook);
    
    return () => {
      window.removeEventListener('prefill-gmail', handleGmail);
      window.removeEventListener('prefill-outlook', handleOutlook);
    };
  }, []);

  const applyPreset = (preset) => {
    const config = presets[preset];
    if (config) {
      setForm(prev => ({ ...prev, ...config }));
      setActivePreset(preset);
    }
  };

  const handleTest = async () => {
    if (!form.smtp_host || !form.smtp_user || !form.smtp_pass) {
      setError('Fill in SMTP settings first');
      return;
    }
    setTesting(true);
    setError('');
    try {
      await apiCall('/api/smtp/test', { 
        method: 'POST', 
        body: JSON.stringify({
          smtp_host: form.smtp_host,
          smtp_port: form.smtp_port,
          smtp_user: form.smtp_user,
          smtp_pass: form.smtp_pass
        }) 
      }, getToken());
      showNotification('Connection successful! ✓', 'success');
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    setError(''); 
    try { 
      await apiCall('/api/warming/accounts', { method: 'POST', body: JSON.stringify(form) }, getToken()); 
      onSuccess(); 
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    } 
  };

  return (
    <Modal title="Add Warming Account" onClose={onClose} width={550}>
      <form onSubmit={handleSubmit}>
        {/* Quick Fill Buttons */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#374151' }}>
            Quick Setup
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              type="button" 
              onClick={() => applyPreset('gmail')}
              style={{ 
                ...secondaryButtonStyle, 
                flex: 1,
                background: activePreset === 'gmail' ? '#fef2f2' : 'white',
                borderColor: activePreset === 'gmail' ? '#EA4335' : '#e5e7eb',
                color: activePreset === 'gmail' ? '#EA4335' : '#374151'
              }}
            >
              <span style={{ fontSize: 18 }}>📧</span> Gmail
            </button>
            <button 
              type="button" 
              onClick={() => applyPreset('outlook')}
              style={{ 
                ...secondaryButtonStyle, 
                flex: 1,
                background: activePreset === 'outlook' ? '#eff6ff' : 'white',
                borderColor: activePreset === 'outlook' ? '#0078D4' : '#e5e7eb',
                color: activePreset === 'outlook' ? '#0078D4' : '#374151'
              }}
            >
              <span style={{ fontSize: 18 }}>📬</span> Outlook
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Email & Username */}
        <FormField label="Email Address" required>
          <input 
            type="email" 
            value={form.email} 
            onChange={e => {
              setForm({...form, email: e.target.value, smtp_user: e.target.value});
            }} 
            placeholder="you@gmail.com"
            required 
            style={inputStyle} 
          />
        </FormField>

        {/* SMTP Settings */}
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#374151' }}>SMTP Settings (Sending)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <FormField label="Host">
              <input 
                type="text" 
                value={form.smtp_host} 
                onChange={e => setForm({...form, smtp_host: e.target.value})} 
                placeholder="smtp.gmail.com" 
                required 
                style={inputStyle} 
              />
            </FormField>
            <FormField label="Port">
              <input 
                type="number" 
                value={form.smtp_port} 
                onChange={e => setForm({...form, smtp_port: parseInt(e.target.value)})} 
                required 
                style={inputStyle} 
              />
            </FormField>
          </div>
          <FormField label="Username">
            <input 
              type="text" 
              value={form.smtp_user} 
              onChange={e => setForm({...form, smtp_user: e.target.value})} 
              placeholder="you@gmail.com"
              required 
              style={inputStyle} 
            />
          </FormField>
          <FormField label={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Password / App Password
              {activePreset === 'gmail' && (
                <span style={{ fontSize: 11, color: '#EA4335', fontWeight: 400 }}>
                  (Use Gmail App Password)
                </span>
              )}
            </span>
          }>
            <input 
              type="password" 
              value={form.smtp_pass} 
              onChange={e => setForm({...form, smtp_pass: e.target.value})} 
              placeholder={activePreset === 'gmail' ? "16-character app password" : "••••••••"}
              required 
              style={inputStyle} 
            />
          </FormField>
        </div>

        {/* IMAP Settings */}
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#374151' }}>IMAP Settings (Receiving)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <FormField label="Host">
              <input 
                type="text" 
                value={form.imap_host} 
                onChange={e => setForm({...form, imap_host: e.target.value})} 
                placeholder="imap.gmail.com" 
                required 
                style={inputStyle} 
              />
            </FormField>
            <FormField label="Port">
              <input 
                type="number" 
                value={form.imap_port} 
                onChange={e => setForm({...form, imap_port: parseInt(e.target.value)})} 
                required 
                style={inputStyle} 
              />
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleTest} 
            disabled={testing}
            style={{ ...secondaryButtonStyle, minWidth: 120 }}
          >
            {testing ? (
              <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Testing...</>
            ) : (
              <><Check size={14} /> Test Connection</>
            )}
          </button>
          <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, flex: 1 }}>
            {loading ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}
// =============================================================================
// CONTACTS PAGE
// =============================================================================

function ContactsPage({ getToken, showNotification }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = useCallback(async () => { try { const data = await apiCall('/api/contacts', {}, getToken()); setContacts(data.contacts || []); } catch (error) { showNotification('Failed to fetch contacts', 'error'); } finally { setLoading(false); } }, [getToken, showNotification]);
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filteredContacts = contacts.filter(c => c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.company?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Contacts</h1><p style={{ color: '#6b7280' }}>Manage your contact lists ({contacts.length} total)</p></div>
        <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowImportModal(true)} style={secondaryButtonStyle}><Upload size={18} /> Import CSV</button><button onClick={() => setShowAddModal(true)} style={primaryButtonStyle}><Plus size={18} /> Add Contact</button></div>
      </div>
      {contacts.length > 0 && <div style={{ marginBottom: 24, position: 'relative', maxWidth: 400 }}><Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} /><input type="text" placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} /></div>}
      {loading ? <LoadingState message="Loading contacts..." /> : contacts.length === 0 ? <EmptyState icon={UsersIcon} title="No Contacts Yet" description="Add contacts to start your campaigns." action={{ label: 'Add Contact', onClick: () => setShowAddModal(true) }} /> : (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb' }}><th style={tableHeaderStyle}>Name</th><th style={tableHeaderStyle}>Email</th><th style={tableHeaderStyle}>Company</th><th style={tableHeaderStyle}>Title</th><th style={tableHeaderStyle}>Status</th></tr></thead>
            <tbody>{filteredContacts.slice(0, 100).map(contact => (<tr key={contact.id} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={tableCellStyle}>{`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || '-'}</td><td style={tableCellStyle}>{contact.email}</td><td style={tableCellStyle}>{contact.company || '-'}</td><td style={tableCellStyle}>{contact.title || '-'}</td><td style={tableCellStyle}><StatusBadge status={contact.status || 'active'} /></td></tr>))}</tbody>
          </table>
          {filteredContacts.length > 100 && <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Showing 100 of {filteredContacts.length} contacts</div>}
        </div>
      )}
      {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchContacts(); showNotification('Contact added!', 'success'); }} getToken={getToken} />}
      {showImportModal && <ImportContactsModal onClose={() => setShowImportModal(false)} onSuccess={(count) => { setShowImportModal(false); fetchContacts(); showNotification(`${count} contacts imported!`, 'success'); }} getToken={getToken} />}
    </div>
  );
}

function AddContactModal({ onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', company: '', title: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await apiCall('/api/contacts', { method: 'POST', body: JSON.stringify(form) }, getToken()); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); } };

  return (
    <Modal title="Add Contact" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <FormField label="Email" required><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={inputStyle} /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><FormField label="First Name"><input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} style={inputStyle} /></FormField><FormField label="Last Name"><input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} style={inputStyle} /></FormField></div>
        <FormField label="Company"><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} style={inputStyle} /></FormField>
        <FormField label="Title"><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} /></FormField>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button type="submit" disabled={loading} style={primaryButtonStyle}>{loading ? 'Adding...' : 'Add Contact'}</button></div>
      </form>
    </Modal>
  );
}

function ImportContactsModal({ onClose, onSuccess, getToken }) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseCSV = (text) => { const lines = text.trim().split('\n'); if (lines.length < 2) return []; const headers = lines[0].toLowerCase().split(',').map(h => h.trim()); return lines.slice(1).map(line => { const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '')); const contact = {}; headers.forEach((h, i) => { if (h.includes('email')) contact.email = values[i]; else if (h.includes('first')) contact.first_name = values[i]; else if (h.includes('last')) contact.last_name = values[i]; else if (h.includes('company')) contact.company = values[i]; else if (h.includes('title')) contact.title = values[i]; }); return contact; }).filter(c => c.email); };
  const handleSubmit = async () => { const contacts = parseCSV(csvText); if (contacts.length === 0) { setError('No valid contacts found'); return; } setLoading(true); try { const result = await apiCall('/api/contacts', { method: 'POST', body: JSON.stringify(contacts) }, getToken()); onSuccess(result.count || contacts.length); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  const handleFileUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => setCsvText(event.target.result); reader.readAsText(file); } };

  return (
    <Modal title="Import Contacts" onClose={onClose} wide>
      {error && <ErrorMessage message={error} />}
      <div style={{ marginBottom: 20 }}><input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="csv-upload" /><label htmlFor="csv-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#f3f4f6', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}><Upload size={18} /> Choose CSV File</label></div>
      <FormField label="Or paste CSV content"><textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="email,first_name,last_name,company,title&#10;john@acme.com,John,Doe,Acme,CEO" rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13 }} /></FormField>
      {parseCSV(csvText).length > 0 && <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, fontSize: 13, marginTop: 12 }}>Found {parseCSV(csvText).length} contacts to import</div>}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button onClick={handleSubmit} disabled={loading || parseCSV(csvText).length === 0} style={primaryButtonStyle}>{loading ? 'Importing...' : `Import ${parseCSV(csvText).length} Contacts`}</button></div>
    </Modal>
  );
}

// =============================================================================
// TEMPLATES PAGE
// =============================================================================

function TemplatesPage({ getToken, showNotification }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchTemplates = useCallback(async () => { try { const data = await apiCall('/api/templates', {}, getToken()); setTemplates(data.templates || []); } catch (error) { showNotification('Failed to fetch templates', 'error'); } finally { setLoading(false); } }, [getToken, showNotification]);
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = async (id) => { if (!window.confirm('Delete this template?')) return; try { await apiCall(`/api/templates/${id}`, { method: 'DELETE' }, getToken()); showNotification('Template deleted', 'success'); fetchTemplates(); } catch (error) { showNotification('Failed to delete template', 'error'); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Email Templates</h1><p style={{ color: '#6b7280' }}>Create and manage reusable email templates</p></div>
        <button onClick={() => { setEditingTemplate(null); setShowModal(true); }} style={primaryButtonStyle}><Plus size={18} /> New Template</button>
      </div>
      {loading ? <LoadingState message="Loading templates..." /> : templates.length === 0 ? <EmptyState icon={FileText} title="No Templates Yet" description="Create your first email template to speed up campaign creation." action={{ label: 'Create Template', onClick: () => setShowModal(true) }} /> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {templates.map(template => (
            <div key={template.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><h3 style={{ fontSize: 18, fontWeight: 600 }}>{template.name}</h3>{template.is_default && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: '#dbeafe', color: '#1e40af' }}>Default</span>}{template.category && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>{template.category}</span>}</div>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Subject: {template.subject}</p><p style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600 }}>{template.body.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}><button onClick={() => { setEditingTemplate(template); setShowModal(true); }} style={iconButtonStyle}><Edit2 size={16} /></button>{!template.is_default && <button onClick={() => handleDelete(template.id)} style={{ ...iconButtonStyle, background: '#fee2e2', color: '#991b1b' }}><Trash2 size={16} /></button>}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <TemplateModal template={editingTemplate} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchTemplates(); showNotification(editingTemplate ? 'Template updated!' : 'Template created!', 'success'); }} getToken={getToken} />}
    </div>
  );
}

function TemplateModal({ template, onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({ name: template?.name || '', subject: template?.subject || '', body: template?.body || '', category: template?.category || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); try { if (template) { await apiCall(`/api/templates/${template.id}`, { method: 'PUT', body: JSON.stringify(form) }, getToken()); } else { await apiCall('/api/templates', { method: 'POST', body: JSON.stringify(form) }, getToken()); } onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); } };

  return (
    <Modal title={template ? 'Edit Template' : 'Create Template'} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}><FormField label="Template Name" required><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Follow-up #1" required style={inputStyle} /></FormField><FormField label="Category"><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}><option value="">Select category</option><option value="outreach">Outreach</option><option value="follow-up">Follow-up</option><option value="meeting">Meeting</option><option value="other">Other</option></select></FormField></div>
        <FormField label="Subject Line" required><input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Quick question about {{company}}" required style={inputStyle} /></FormField>
        <FormField label="Email Body" required><textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Hi {{first_name}},&#10;&#10;..." required rows={12} style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} /></FormField>
        <VariableHint />
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button type="submit" disabled={loading} style={primaryButtonStyle}>{loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}</button></div>
      </form>
    </Modal>
  );
}

// =============================================================================
// CAMPAIGNS PAGE
// =============================================================================

function CampaignsPage({ getToken, showNotification }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCampaigns = useCallback(async () => { try { const data = await apiCall('/api/campaigns', {}, getToken()); setCampaigns(data.campaigns || []); } catch (error) { showNotification('Failed to fetch campaigns', 'error'); } finally { setLoading(false); } }, [getToken, showNotification]);
  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Campaigns</h1><p style={{ color: '#6b7280' }}>Create and manage email campaigns</p></div>
        <button onClick={() => setShowCreateModal(true)} style={primaryButtonStyle}><Plus size={18} /> New Campaign</button>
      </div>
      {loading ? <LoadingState message="Loading campaigns..." /> : campaigns.length === 0 ? <EmptyState icon={Mail} title="No Campaigns Yet" description="Create your first email campaign." action={{ label: 'Create Campaign', onClick: () => setShowCreateModal(true) }} /> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {campaigns.map(campaign => (
            <div key={campaign.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><h3 style={{ fontSize: 18, fontWeight: 600 }}>{campaign.name}</h3><StatusBadge status={campaign.status} /></div><p style={{ fontSize: 14, color: '#6b7280' }}>Subject: {campaign.subject}</p><p style={{ fontSize: 13, color: '#9ca3af' }}>From: {campaign.from_name} &lt;{campaign.from_email}&gt;</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                <div><p style={{ fontSize: 24, fontWeight: 'bold' }}>{campaign.total_recipients || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Recipients</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>{campaign.emails_sent || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Sent</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>{campaign.emails_opened || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Opened</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#06b6d4' }}>{campaign.emails_clicked || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Clicked</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{campaign.emails_replied || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Replied</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreateModal && <CreateCampaignModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchCampaigns(); showNotification('Campaign created!', 'success'); }} getToken={getToken} />}
    </div>
  );
}

function CreateCampaignModal({ onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({ name: '', subject: '', body: '', from_name: '', from_email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await apiCall('/api/campaigns', { method: 'POST', body: JSON.stringify(form) }, getToken()); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); } };

  return (
    <Modal title="Create Campaign" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <FormField label="Campaign Name" required><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={inputStyle} /></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><FormField label="From Name" required><input type="text" value={form.from_name} onChange={e => setForm({...form, from_name: e.target.value})} required style={inputStyle} /></FormField><FormField label="From Email" required><input type="email" value={form.from_email} onChange={e => setForm({...form, from_email: e.target.value})} required style={inputStyle} /></FormField></div>
        <FormField label="Subject Line" required><input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required style={inputStyle} /></FormField>
        <FormField label="Email Body" required><textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} required rows={10} style={{ ...inputStyle, resize: 'vertical' }} /></FormField>
        <VariableHint />
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button type="submit" disabled={loading} style={primaryButtonStyle}>{loading ? 'Creating...' : 'Create Campaign'}</button></div>
      </form>
    </Modal>
  );
}

// =============================================================================
// SEQUENCES PAGE
// =============================================================================

function SequencesPage({ getToken, showNotification }) {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchSequences = useCallback(async () => { try { const data = await apiCall('/api/sequences', {}, getToken()); setSequences(data.sequences || []); } catch (error) { showNotification('Failed to fetch sequences', 'error'); } finally { setLoading(false); } }, [getToken, showNotification]);
  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const handleStart = async (id) => { try { await apiCall(`/api/sequences/${id}/start`, { method: 'POST' }, getToken()); showNotification('Sequence started!', 'success'); fetchSequences(); } catch (error) { showNotification('Failed to start sequence', 'error'); } };
  const handlePause = async (id) => { try { await apiCall(`/api/sequences/${id}/pause`, { method: 'POST' }, getToken()); showNotification('Sequence paused', 'success'); fetchSequences(); } catch (error) { showNotification('Failed to pause sequence', 'error'); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Follow-up Sequences</h1><p style={{ color: '#6b7280' }}>Automated multi-step email campaigns</p></div>
        <button onClick={() => setShowModal(true)} style={primaryButtonStyle}><Plus size={18} /> New Sequence</button>
      </div>
      {loading ? <LoadingState message="Loading sequences..." /> : sequences.length === 0 ? <EmptyState icon={Zap} title="No Sequences Yet" description="Create automated follow-up sequences to nurture your leads." action={{ label: 'Create Sequence', onClick: () => setShowModal(true) }} /> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {sequences.map(sequence => (
            <div key={sequence.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><h3 style={{ fontSize: 18, fontWeight: 600 }}>{sequence.name}</h3><StatusBadge status={sequence.status} /></div>{sequence.description && <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{sequence.description}</p>}<p style={{ fontSize: 13, color: '#9ca3af' }}>From: {sequence.from_name} &lt;{sequence.from_email}&gt;</p></div>
                <div style={{ display: 'flex', gap: 8 }}>{sequence.status === 'draft' || sequence.status === 'paused' ? <button onClick={() => handleStart(sequence.id)} style={{ ...iconButtonStyle, background: '#d1fae5', color: '#065f46' }}><Play size={16} /></button> : <button onClick={() => handlePause(sequence.id)} style={{ ...iconButtonStyle, background: '#fef3c7', color: '#92400e' }}><Pause size={16} /></button>}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                <div><p style={{ fontSize: 24, fontWeight: 'bold' }}>{sequence.total_contacts || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Total Contacts</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>{sequence.active_contacts || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Active</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{sequence.completed_contacts || 0}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Completed</p></div>
                <div><p style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>-</p><p style={{ fontSize: 12, color: '#6b7280' }}>Steps</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <SequenceModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchSequences(); showNotification('Sequence created!', 'success'); }} getToken={getToken} />}
    </div>
  );
}

function SequenceModal({ onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({ name: '', description: '', from_name: '', from_email: '', steps: [{ subject: '', body: '', delay_days: 0, delay_hours: 0 }, { subject: '', body: '', delay_days: 3, delay_hours: 0 }, { subject: '', body: '', delay_days: 7, delay_hours: 0 }] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); try { await apiCall('/api/sequences', { method: 'POST', body: JSON.stringify(form) }, getToken()); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  const updateStep = (index, field, value) => { const newSteps = [...form.steps]; newSteps[index] = { ...newSteps[index], [field]: value }; setForm({ ...form, steps: newSteps }); };
  const addStep = () => { setForm({ ...form, steps: [...form.steps, { subject: '', body: '', delay_days: form.steps.length * 3, delay_hours: 0 }] }); setCurrentStep(form.steps.length); };
  const removeStep = (index) => { if (form.steps.length <= 1) return; const newSteps = form.steps.filter((_, i) => i !== index); setForm({ ...form, steps: newSteps }); if (currentStep >= newSteps.length) setCurrentStep(newSteps.length - 1); };

  return (
    <Modal title="Create Follow-up Sequence" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><FormField label="Sequence Name" required><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Q4 Outreach Sequence" required style={inputStyle} /></FormField><FormField label="Description"><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="3-step follow-up for cold leads" style={inputStyle} /></FormField></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><FormField label="From Name" required><input type="text" value={form.from_name} onChange={e => setForm({...form, from_name: e.target.value})} placeholder="John from Acme" required style={inputStyle} /></FormField><FormField label="From Email" required><input type="email" value={form.from_email} onChange={e => setForm({...form, from_email: e.target.value})} placeholder="john@acme.com" required style={inputStyle} /></FormField></div>
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {form.steps.map((step, i) => <button key={i} type="button" onClick={() => setCurrentStep(i)} style={{ padding: '8px 16px', background: currentStep === i ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6', color: currentStep === i ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Step {i + 1} {step.delay_days > 0 && <span style={{ opacity: 0.7 }}>({step.delay_days}d)</span>}</button>)}
            <button type="button" onClick={addStep} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}><Plus size={14} /> Add Step</button>
          </div>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h4 style={{ fontSize: 16, fontWeight: 600 }}>Step {currentStep + 1}</h4>{form.steps.length > 1 && <button type="button" onClick={() => removeStep(currentStep)} style={{ padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Remove Step</button>}</div>
          {currentStep > 0 && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}><FormField label="Wait Days"><input type="number" min="0" value={form.steps[currentStep].delay_days} onChange={e => updateStep(currentStep, 'delay_days', parseInt(e.target.value))} style={inputStyle} /></FormField><FormField label="Wait Hours"><input type="number" min="0" max="23" value={form.steps[currentStep].delay_hours} onChange={e => updateStep(currentStep, 'delay_hours', parseInt(e.target.value))} style={inputStyle} /></FormField></div>}
          <FormField label="Subject Line" required><input type="text" value={form.steps[currentStep].subject} onChange={e => updateStep(currentStep, 'subject', e.target.value)} placeholder={currentStep === 0 ? 'Quick question about {{company}}' : 'Re: Quick question about {{company}}'} required style={inputStyle} /></FormField>
          <FormField label="Email Body" required><textarea value={form.steps[currentStep].body} onChange={e => updateStep(currentStep, 'body', e.target.value)} placeholder="Hi {{first_name}},&#10;&#10;..." required rows={8} style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} /></FormField>
        </div>
        <VariableHint />
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button type="submit" disabled={loading} style={primaryButtonStyle}>{loading ? 'Creating...' : 'Create Sequence'}</button></div>
      </form>
    </Modal>
  );
}

// =============================================================================
// DOMAINS PAGE
// =============================================================================

function DomainsPage({ getToken, showNotification }) {
  const [cloudflareConfig, setCloudflareConfig] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);

  const fetchData = useCallback(async () => { try { const configRes = await apiCall('/api/cloudflare/config', {}, getToken()); setCloudflareConfig(configRes); const domainsRes = await apiCall('/api/domains', {}, getToken()); setDomains(domainsRes.domains || []); } catch (error) { console.error(error); } finally { setLoading(false); } }, [getToken]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteDomain = async (id) => { if (!window.confirm('Remove this domain from your account?')) return; try { await apiCall(`/api/domains/${id}`, { method: 'DELETE' }, getToken()); showNotification('Domain removed', 'success'); fetchData(); } catch (error) { showNotification('Failed to remove domain', 'error'); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Domains</h1><p style={{ color: '#6b7280' }}>Purchase and manage domains for your email campaigns</p></div>
        {cloudflareConfig?.configured && <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowImportModal(true)} style={secondaryButtonStyle}><ExternalLink size={18} /> Import Existing</button><button onClick={() => setShowSearchModal(true)} style={primaryButtonStyle}><Plus size={18} /> Buy Domain</button></div>}
      </div>
      {loading ? <LoadingState message="Loading domains..." /> : !cloudflareConfig?.configured ? <CloudflareSetupCard onConnect={() => setShowConnectModal(true)} /> : (
        <>
          <div style={{ background: '#d1fae5', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={20} color="#065f46" /><span style={{ color: '#065f46', fontWeight: 500 }}>Cloudflare connected: {cloudflareConfig.config?.account_name || 'Account'}</span></div><button onClick={() => setShowConnectModal(true)} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Update Settings</button></div>
          {domains.length === 0 ? <EmptyState icon={Globe} title="No Domains Yet" description="Purchase a new domain or import existing domains from your Cloudflare account." action={{ label: 'Search Domains', onClick: () => setShowSearchModal(true) }} /> : (
            <div style={{ display: 'grid', gap: 16 }}>
              {domains.map(domain => <DomainCard key={domain.id} domain={domain} onConfigure={() => setSelectedDomain(domain)} onDelete={() => handleDeleteDomain(domain.id)} getToken={getToken} showNotification={showNotification} onRefresh={fetchData} />)}
            </div>
          )}
        </>
      )}
      {showConnectModal && <CloudflareConnectModal existing={cloudflareConfig?.config} onClose={() => setShowConnectModal(false)} onSuccess={() => { setShowConnectModal(false); fetchData(); showNotification('Cloudflare connected!', 'success'); }} getToken={getToken} />}
      {showSearchModal && <DomainSearchModal onClose={() => setShowSearchModal(false)} onPurchase={() => { setShowSearchModal(false); fetchData(); }} getToken={getToken} showNotification={showNotification} />}
      {showImportModal && <ImportDomainsModal onClose={() => setShowImportModal(false)} onImport={() => { setShowImportModal(false); fetchData(); showNotification('Domains imported!', 'success'); }} getToken={getToken} />}
      {selectedDomain && <DomainConfigModal domain={selectedDomain} onClose={() => setSelectedDomain(null)} onUpdate={() => { setSelectedDomain(null); fetchData(); }} getToken={getToken} showNotification={showNotification} />}
    </div>
  );
}

function CloudflareSetupCard({ onConnect }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Globe size={40} color="white" /></div>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Connect Cloudflare</h2>
      <p style={{ color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>Connect your Cloudflare account to purchase domains at cost, configure DNS automatically, and set up email routing.</p>
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, marginBottom: 32, textAlign: 'left' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>With Cloudflare you get:</h3>
        <div style={{ display: 'grid', gap: 12 }}>{['At-cost domain pricing (no markup)', 'Automatic DNS configuration', 'Free email routing & forwarding', 'SPF, DKIM, DMARC auto-setup'].map((text, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Check size={18} color="#10b981" /><span style={{ fontSize: 14, color: '#374151' }}>{text}</span></div>)}</div>
      </div>
      <button onClick={onConnect} style={{ ...primaryButtonStyle, padding: '16px 32px', fontSize: 16 }}><Globe size={20} /> Connect Cloudflare Account</button>
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 16 }}>Don't have an account? <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Create one for free →</a></p>
    </div>
  );
}

function CloudflareConnectModal({ existing, onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({ apiToken: '', accountId: existing?.account_id || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); try { await apiCall('/api/cloudflare/config', { method: 'POST', body: JSON.stringify(form) }, getToken()); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); } };

  return (
    <Modal title="Connect Cloudflare" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <div style={{ background: '#fffbeb', borderRadius: 8, padding: 16, marginBottom: 24 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>How to get your API credentials:</h4><ol style={{ fontSize: 13, color: '#78350f', paddingLeft: 20, margin: 0, lineHeight: 1.8 }}><li>Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Cloudflare API Tokens</a></li><li>Click "Create Token" → Use "Edit zone DNS" template</li><li>Get Account ID from any zone's Overview page (right sidebar)</li></ol></div>
        <FormField label="API Token" required><input type="password" value={form.apiToken} onChange={e => setForm({...form, apiToken: e.target.value})} placeholder="Enter your Cloudflare API token" required style={inputStyle} /></FormField>
        <FormField label="Account ID" required><input type="text" value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})} placeholder="e.g., a1b2c3d4e5f6..." required style={inputStyle} /></FormField>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button><button type="submit" disabled={loading} style={primaryButtonStyle}>{loading ? 'Connecting...' : 'Connect Cloudflare'}</button></div>
      </form>
    </Modal>
  );
}

function DomainSearchModal({ onClose, onPurchase, getToken, showNotification }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(null);

  const handleSearch = async () => { if (query.length < 2) return; setSearching(true); try { const data = await apiCall('/api/domains/search', { method: 'POST', body: JSON.stringify({ query }) }, getToken()); setResults(data.results || []); } catch (error) { showNotification('Search failed: ' + error.message, 'error'); } finally { setSearching(false); } };
  const handlePurchase = async (domain) => { setPurchasing(domain); try { await apiCall('/api/domains/purchase', { method: 'POST', body: JSON.stringify({ domain }) }, getToken()); showNotification(`${domain} purchased successfully!`, 'success'); onPurchase(); } catch (error) { showNotification('Purchase failed: ' + error.message, 'error'); } finally { setPurchasing(null); } };

  return (
    <Modal title="Search & Buy Domains" onClose={onClose} wide>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}><div style={{ flex: 1, position: 'relative' }}><Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} /><input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Enter domain name (e.g., mycompany)" style={{ ...inputStyle, paddingLeft: 40 }} /></div><button onClick={handleSearch} disabled={searching || query.length < 2} style={primaryButtonStyle}>{searching ? <RefreshCw size={18} /> : 'Search'}</button></div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>We'll check availability across .com, .io, .co, .net, .dev, and .app</p>
      </div>
      {results.length > 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}><span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Search Results</span></div>
          {results.map((result, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: i < results.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{result.available === true ? <CheckCircle size={20} color="#10b981" /> : result.available === false ? <XCircle size={20} color="#ef4444" /> : <Clock size={20} color="#f59e0b" />}<div><p style={{ fontWeight: 600, fontSize: 15 }}>{result.domain}</p><p style={{ fontSize: 12, color: '#6b7280' }}>{result.available === true ? 'Available' : result.available === false ? 'Taken' : 'Status unknown'}{result.premium && ' • Premium'}</p></div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>{result.available !== false && <span style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>${result.price?.toFixed(2) || '?.??'}/yr</span>}{result.available !== false && <button onClick={() => handlePurchase(result.domain)} disabled={purchasing === result.domain} style={{ ...primaryButtonStyle, padding: '8px 16px', fontSize: 13 }}>{purchasing === result.domain ? 'Buying...' : 'Buy Now'}</button>}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}><button onClick={onClose} style={secondaryButtonStyle}>Close</button></div>
    </Modal>
  );
}

function ImportDomainsModal({ onClose, onImport, getToken }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(null);

  useEffect(() => { const fetchZones = async () => { try { const data = await apiCall('/api/cloudflare/zones', {}, getToken()); setZones(data.zones || []); } catch (e) { console.error(e); } finally { setLoading(false); } }; fetchZones(); }, [getToken]);
  const handleImport = async (zone) => { setImporting(zone.id); try { await apiCall('/api/domains/import', { method: 'POST', body: JSON.stringify({ zoneId: zone.id, zoneName: zone.name }) }, getToken()); onImport(); } catch (e) { console.error(e); } finally { setImporting(null); } };

  return (
    <Modal title="Import Domains from Cloudflare" onClose={onClose} wide>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><RefreshCw size={24} color="#6b7280" /><p style={{ color: '#6b7280', marginTop: 12 }}>Loading your domains...</p></div> : zones.length === 0 ? <div style={{ textAlign: 'center', padding: 40 }}><Globe size={48} color="#9ca3af" style={{ marginBottom: 16 }} /><p style={{ color: '#6b7280' }}>No domains found in your Cloudflare account</p></div> : (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>{zones.map(zone => <div key={zone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f3f4f6' }}><div><p style={{ fontWeight: 600 }}>{zone.name}</p><p style={{ fontSize: 12, color: '#6b7280' }}>Status: {zone.status}</p></div><button onClick={() => handleImport(zone)} disabled={importing === zone.id} style={{ ...secondaryButtonStyle, padding: '8px 16px', fontSize: 13 }}>{importing === zone.id ? 'Importing...' : 'Import'}</button></div>)}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}><button onClick={onClose} style={secondaryButtonStyle}>Close</button></div>
    </Modal>
  );
}

function DomainCard({ domain, onConfigure, onDelete, getToken, showNotification, onRefresh }) {
  const [configuring, setConfiguring] = useState(false);
  const [enablingWarming, setEnablingWarming] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleQuickSetup = async () => { setConfiguring(true); try { await apiCall(`/api/domains/${domain.id}/configure-dns`, { method: 'POST' }, getToken()); showNotification('DNS configured!', 'success'); onRefresh(); } catch (error) { showNotification('Setup failed: ' + error.message, 'error'); } finally { setConfiguring(false); } };

  const handleEnableWarming = async () => {
    setEnablingWarming(true);
    try {
      await apiCall(`/api/domains/${domain.id}/enable-warming`, { method: 'POST' }, getToken());
      showNotification('🔥 Warming enabled! DNS records added.', 'success');
      onRefresh();
    } catch (error) {
      showNotification('Failed: ' + error.message, 'error');
    } finally {
      setEnablingWarming(false);
    }
  };

  const handleCheckWarmingStatus = async () => {
    setCheckingStatus(true);
    try {
      const status = await apiCall(`/api/domains/${domain.id}/warming-status`, {}, getToken());
      if (status.verified) {
        showNotification('✅ Domain verified! Ready to warm.', 'success');
      } else {
        showNotification(`Status: ${status.status}. DNS may still be propagating.`, 'info');
      }
      onRefresh();
    } catch (error) {
      showNotification('Check failed: ' + error.message, 'error');
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><Globe size={20} color="#667eea" /><h3 style={{ fontSize: 18, fontWeight: 600 }}>{domain.domain_name}</h3><StatusBadge status={domain.status} /></div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: domain.dns_configured ? '#10b981' : '#f59e0b' }} /><Server size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#6b7280' }}>DNS</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: domain.email_routing_enabled ? '#10b981' : '#f59e0b' }} /><Mail size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#6b7280' }}>Email Routing</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: domain.warming_status === 'verified' ? '#10b981' : domain.warming_enabled ? '#f59e0b' : '#d1d5db' }} /><Flame size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#6b7280' }}>Warming {domain.warming_status === 'verified' ? '✓' : domain.warming_enabled ? '(pending)' : ''}</span></div>
            {domain.forward_to && <div style={{ fontSize: 13, color: '#6b7280' }}>Forwards to: <strong>{domain.forward_to}</strong></div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!domain.dns_configured && <button onClick={handleQuickSetup} disabled={configuring} style={{ ...primaryButtonStyle, padding: '8px 16px', fontSize: 13 }}>{configuring ? 'Setting up...' : 'Quick Setup'}</button>}
          {!domain.warming_enabled && domain.dns_configured && (
            <button onClick={handleEnableWarming} disabled={enablingWarming} style={{ ...secondaryButtonStyle, padding: '8px 16px', fontSize: 13, background: '#fef3c7', color: '#92400e' }}>
              <Flame size={14} />{enablingWarming ? 'Enabling...' : 'Enable Warming'}
            </button>
          )}
          {domain.warming_enabled && domain.warming_status !== 'verified' && (
            <button onClick={handleCheckWarmingStatus} disabled={checkingStatus} style={{ ...secondaryButtonStyle, padding: '8px 16px', fontSize: 13 }}>
              <RefreshCw size={14} />{checkingStatus ? 'Checking...' : 'Check Status'}
            </button>
          )}
          <button onClick={onConfigure} style={iconButtonStyle}><Settings size={16} /></button>
          <button onClick={onDelete} style={{ ...iconButtonStyle, background: '#fee2e2', color: '#991b1b' }}><Trash2 size={16} /></button>
        </div>
      </div>
      {domain.warming_enabled && domain.warming_status === 'verified' && (
        <div style={{ marginTop: 16, padding: 12, background: '#d1fae5', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} color="#065f46" />
          <span style={{ color: '#065f46', fontSize: 13 }}>Warming ready! Emails: team@, hello@, contact@, info@{domain.domain_name}</span>
        </div>
      )}
    </div>
  );
}

function DomainConfigModal({ domain, onClose, onUpdate, getToken, showNotification }) {
  const [forwardTo, setForwardTo] = useState(domain.forward_to || '');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dns');

  const handleConfigureDns = async () => { setLoading(true); try { await apiCall(`/api/domains/${domain.id}/configure-dns`, { method: 'POST' }, getToken()); showNotification('DNS configured!', 'success'); onUpdate(); } catch (e) { showNotification('Failed: ' + e.message, 'error'); } finally { setLoading(false); } };
  const handleEnableEmailRouting = async () => { setLoading(true); try { await apiCall(`/api/domains/${domain.id}/enable-email-routing`, { method: 'POST', body: JSON.stringify({ forwardTo }) }, getToken()); showNotification('Email routing enabled!', 'success'); onUpdate(); } catch (e) { showNotification('Failed: ' + e.message, 'error'); } finally { setLoading(false); } };
  const handleFullSetup = async () => { setLoading(true); try { await apiCall(`/api/domains/${domain.id}/full-setup`, { method: 'POST', body: JSON.stringify({ forwardTo }) }, getToken()); showNotification('Domain fully configured!', 'success'); onUpdate(); } catch (e) { showNotification('Failed: ' + e.message, 'error'); } finally { setLoading(false); } };

  return (
    <Modal title={`Configure ${domain.domain_name}`} onClose={onClose} wide>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>{['dns', 'email'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: activeTab === tab ? '#667eea' : 'transparent', color: activeTab === tab ? 'white' : '#6b7280', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>{tab === 'dns' ? 'DNS Setup' : 'Email Routing'}</button>)}</div>
      {activeTab === 'dns' && <div>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Configure DNS records for email deliverability (MX, SPF, DKIM, DMARC).</p>
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 20 }}><h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Records to be created:</h4><div style={{ display: 'grid', gap: 8, fontSize: 13 }}><div><strong>MX:</strong> Cloudflare email routing servers</div><div><strong>SPF:</strong> v=spf1 include:_spf.mx.cloudflare.net ~all</div><div><strong>DMARC:</strong> v=DMARC1; p=quarantine</div></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 14 }}>Current Status:</span>{domain.dns_configured ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}><CheckCircle size={16} /> Configured</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}><Clock size={16} /> Not configured</span>}</div>
        <button onClick={handleConfigureDns} disabled={loading} style={{ ...primaryButtonStyle, marginTop: 20 }}>{loading ? 'Configuring...' : domain.dns_configured ? 'Reconfigure DNS' : 'Configure DNS'}</button>
      </div>}
      {activeTab === 'email' && <div>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Enable email routing to forward emails from {domain.domain_name} to your existing email address.</p>
        <FormField label="Forward all emails to:"><input type="email" value={forwardTo} onChange={e => setForwardTo(e.target.value)} placeholder="your-email@gmail.com" style={inputStyle} /><p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>All emails to *@{domain.domain_name} will be forwarded here</p></FormField>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}><span style={{ fontSize: 14 }}>Current Status:</span>{domain.email_routing_enabled ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}><CheckCircle size={16} /> Enabled</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}><Clock size={16} /> Disabled</span>}</div>
        <button onClick={handleEnableEmailRouting} disabled={loading || !forwardTo} style={primaryButtonStyle}>{loading ? 'Enabling...' : 'Enable Email Routing'}</button>
      </div>}
      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 24, paddingTop: 24 }}><button onClick={handleFullSetup} disabled={loading} style={{ ...primaryButtonStyle, width: '100%', justifyContent: 'center' }}><Zap size={18} />{loading ? 'Setting up...' : 'Complete Full Setup (DNS + Email Routing)'}</button></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button onClick={onClose} style={secondaryButtonStyle}>Close</button></div>
    </Modal>
  );
}

// =============================================================================
// SETTINGS PAGE
// =============================================================================

function SettingsPage({ showNotification }) {
  const [settings, setSettings] = useState(() => { const saved = localStorage.getItem('emailSettings'); return saved ? JSON.parse(saved) : { senderName: '', emailSignature: '', timezone: 'UTC', dailyLimit: 50, sendingDelay: 60 }; });
  const handleSave = () => { localStorage.setItem('emailSettings', JSON.stringify(settings)); showNotification('Settings saved!', 'success'); };

  return (
    <div>
      <div style={{ marginBottom: 32 }}><h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Settings</h1><p style={{ color: '#6b7280' }}>Configure your system preferences</p></div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, maxWidth: 600 }}>
        <FormField label="Default Sender Name"><input type="text" value={settings.senderName} onChange={e => setSettings({...settings, senderName: e.target.value})} style={inputStyle} /></FormField>
        <FormField label="Email Signature"><textarea value={settings.emailSignature} onChange={e => setSettings({...settings, emailSignature: e.target.value})} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></FormField>
        <FormField label="Timezone"><select value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})} style={inputStyle}><option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="America/Los_Angeles">Pacific Time</option><option value="Europe/London">London</option></select></FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><FormField label="Daily Email Limit"><input type="number" value={settings.dailyLimit} onChange={e => setSettings({...settings, dailyLimit: parseInt(e.target.value)})} min={1} max={500} style={inputStyle} /></FormField><FormField label="Delay Between Emails (sec)"><input type="number" value={settings.sendingDelay} onChange={e => setSettings({...settings, sendingDelay: parseInt(e.target.value)})} min={10} style={inputStyle} /></FormField></div>
        <button onClick={handleSave} style={{ ...primaryButtonStyle, marginTop: 24 }}>Save Settings</button>
      </div>
    </div>
  );
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 12, maxWidth: wide ? 700 : 500, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h2 style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</h2><button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6b7280' }}><X size={24} /></button></div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) { return <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>{children}</div>; }
function ErrorMessage({ message }) { return <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontSize: 14 }}>{message}</div>; }
function LoadingState({ message }) { return <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 60, textAlign: 'center' }}><RefreshCw size={32} color="#6b7280" style={{ margin: '0 auto 16px' }} /><p style={{ color: '#6b7280', fontSize: 14 }}>{message}</p></div>; }
function EmptyState({ icon: Icon, title, description, action }) { return <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 60, textAlign: 'center' }}><Icon size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} /><h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#374151' }}>{title}</h3><p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>{description}</p>{action && <button onClick={action.onClick} style={primaryButtonStyle}><Plus size={18} style={{ marginRight: 8 }} />{action.label}</button>}</div>; }
function StatusBadge({ status }) { const colors = { active: { bg: '#d1fae5', text: '#065f46' }, sending: { bg: '#dbeafe', text: '#1e40af' }, sent: { bg: '#d1fae5', text: '#065f46' }, completed: { bg: '#d1fae5', text: '#065f46' }, paused: { bg: '#fef3c7', text: '#92400e' }, draft: { bg: '#f3f4f6', text: '#6b7280' }, error: { bg: '#fee2e2', text: '#991b1b' }, unsubscribed: { bg: '#fee2e2', text: '#991b1b' }, pending: { bg: '#fef3c7', text: '#92400e' } }; const c = colors[status] || colors.draft; return <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>{status}</span>; }
function VariableHint() { return <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280', marginTop: 16 }}>💡 Variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{company}}'}, {'{{title}}'}, {'{{email}}'}</div>; }

// =============================================================================
// STYLES
// =============================================================================

const inputStyle = { width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const primaryButtonStyle = { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 };
const secondaryButtonStyle = { padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
const iconButtonStyle = { padding: 8, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableHeaderStyle = { padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableCellStyle = { padding: '16px 20px', fontSize: 14, color: '#374151' };
