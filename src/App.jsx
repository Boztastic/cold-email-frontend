import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = React.createContext(null);

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, companyName) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, companyName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, authFetch, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// LOGIN PAGE
// ============================================
function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, companyName);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <h1 style={styles.loginTitle}>🦈 Shark Email</h1>
        <p style={styles.loginSubtitle}>Cold email outreach platform</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={styles.input}
            />
          )}
          
          {error && <p style={styles.error}>{error}</p>}
          
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p style={styles.switchAuth}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={styles.linkButton}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE
// ============================================
function DashboardPage() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await authFetch('/api/warming/status');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Dashboard</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats?.total_sent || 0}</div>
          <div style={styles.statLabel}>Emails Sent</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats?.ai_generated || 0}</div>
          <div style={styles.statLabel}>AI Generated</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.stats?.replies || 0}</div>
          <div style={styles.statLabel}>Replies</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.status?.emails_per_day || 10}</div>
          <div style={styles.statLabel}>Per Day</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Recent Warming Activity</h3>
        {stats?.recentEmails?.length > 0 ? (
          <div style={styles.emailList}>
            {stats.recentEmails.map((email, i) => (
              <div key={i} style={styles.emailItem}>
                <span style={styles.emailIcon}>📤</span>
                <span style={styles.emailFrom}>{email.from_email}</span>
                <span style={styles.emailArrow}>→</span>
                <span style={styles.emailTo}>{email.to_email}</span>
                <span style={styles.emailSubject}>{email.subject}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No warming emails sent yet. Enable warming to get started.</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// DOMAINS PAGE
// ============================================
function DomainsPage() {
  const { authFetch } = useAuth();
  const [domains, setDomains] = useState([]);
  const [cloudflareDomains, setCloudflareDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [setupLog, setSetupLog] = useState([]);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const res = await authFetch('/api/domains');
      const data = await res.json();
      setDomains(data);
    } catch (err) {
      console.error('Failed to load domains:', err);
    }
  };

  const loadCloudflareDomains = async () => {
    setLoading(true);
    setShowImport(true);
    try {
      const res = await authFetch('/api/cloudflare/domains');
      const data = await res.json();
      if (res.ok) {
        setCloudflareDomains(data.domains || []);
      } else {
        alert(data.error || 'Failed to load Cloudflare domains');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoading(false);
  };

  const importDomain = async (zone) => {
    setImporting(zone.id);
    setSetupLog([]);
    try {
      const res = await authFetch('/api/domains/import', {
        method: 'POST',
        body: JSON.stringify({ zoneId: zone.id, domainName: zone.name })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSetupLog(data.setupLog || []);
        setCloudflareDomains(prev => 
          prev.map(d => d.id === zone.id ? { ...d, imported: true } : d)
        );
        loadDomains();
      } else {
        alert(data.error || 'Failed to import');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setImporting(null);
  };

  const refreshDomain = async (domainId) => {
    try {
      const res = await authFetch(`/api/domains/${domainId}/refresh`, { method: 'POST' });
      if (res.ok) {
        loadDomains();
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const enableInbox = async (domainId) => {
    try {
      const res = await authFetch(`/api/domains/${domainId}/enable-inbox`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Inbox enabled! Emails will now be received.');
        loadDomains();
      } else {
        alert(data.error || 'Failed to enable inbox');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const deleteDomain = async (domainId) => {
    if (!confirm('Delete this domain?')) return;
    try {
      await authFetch(`/api/domains/${domainId}`, { method: 'DELETE' });
      loadDomains();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Domains</h2>
      
      {/* Import from Cloudflare */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3>☁️ Import from Cloudflare</h3>
          <button onClick={loadCloudflareDomains} style={styles.primaryButton} disabled={loading}>
            {loading ? 'Loading...' : showImport ? 'Refresh List' : 'Load My Domains'}
          </button>
        </div>
        
        {showImport && (
          <div style={styles.importList}>
            {cloudflareDomains.length === 0 ? (
              <p style={styles.emptyText}>
                {loading ? 'Loading domains from Cloudflare...' : 'No domains found in Cloudflare'}
              </p>
            ) : (
              cloudflareDomains.map(zone => (
                <div key={zone.id} style={styles.importItem}>
                  <div style={styles.importInfo}>
                    <span style={styles.importName}>{zone.name}</span>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: zone.imported ? '#10b981' : '#3b82f6'
                    }}>
                      {zone.imported ? '✓ Imported' : 'Available'}
                    </span>
                  </div>
                  {!zone.imported && (
                    <button 
                      onClick={() => importDomain(zone)}
                      style={styles.importButton}
                      disabled={importing === zone.id}
                    >
                      {importing === zone.id ? 'Setting up...' : 'Import & Setup'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Setup Log */}
        {setupLog.length > 0 && (
          <div style={styles.setupLog}>
            <h4>Setup Progress</h4>
            {setupLog.map((item, i) => (
              <div key={i} style={styles.setupLogItem}>
                <span style={{
                  ...styles.setupLogIcon,
                  color: item.status === 'success' ? '#10b981' : 
                         item.status === 'warning' ? '#f59e0b' : 
                         item.status === 'error' ? '#ef4444' : '#94a3b8'
                }}>
                  {item.status === 'success' ? '✓' : 
                   item.status === 'warning' ? '⚠' : 
                   item.status === 'error' ? '✗' : '○'}
                </span>
                <span style={styles.setupLogStep}>{item.step}</span>
                <span style={styles.setupLogMessage}>{item.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Imported Domains */}
      <div style={styles.card}>
        <h3>Your Domains</h3>
        {domains.length === 0 ? (
          <p style={styles.emptyText}>No domains imported yet. Click "Load My Domains" above to get started.</p>
        ) : (
          <div style={styles.domainList}>
            {domains.map(domain => (
              <div key={domain.id} style={styles.domainCard}>
                <div style={styles.domainHeader}>
                  <span style={styles.domainName}>{domain.domain_name}</span>
                  <div style={styles.domainBadges}>
                    {domain.resend_verified && (
                      <span style={{...styles.badge, backgroundColor: '#10b981'}}>✓ Sending</span>
                    )}
                    {domain.inbox_enabled && (
                      <span style={{...styles.badge, backgroundColor: '#3b82f6'}}>📥 Inbox</span>
                    )}
                    {!domain.resend_verified && (
                      <span style={{...styles.badge, backgroundColor: '#f59e0b'}}>⏳ Verifying</span>
                    )}
                  </div>
                </div>
                
                <div style={styles.domainStatus}>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Sending:</span>
                    <span style={domain.resend_verified ? styles.statusOk : styles.statusPending}>
                      {domain.resend_verified ? '✓ Ready' : '⏳ Pending verification'}
                    </span>
                  </div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Inbox:</span>
                    <span style={domain.inbox_enabled ? styles.statusOk : styles.statusPending}>
                      {domain.inbox_enabled ? '✓ Active' : '○ Not enabled'}
                    </span>
                  </div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Accounts:</span>
                    <span style={{color: '#94a3b8'}}>team@, hello@, contact@, info@</span>
                  </div>
                </div>

                <div style={styles.domainActions}>
                  {!domain.resend_verified && (
                    <button 
                      onClick={() => refreshDomain(domain.id)} 
                      style={styles.actionButton}
                    >
                      🔄 Check Status
                    </button>
                  )}
                  {domain.zone_id && !domain.inbox_enabled && (
                    <button 
                      onClick={() => enableInbox(domain.id)} 
                      style={{...styles.actionButton, backgroundColor: '#3b82f6'}}
                    >
                      📥 Enable Inbox
                    </button>
                  )}
                  <button 
                    onClick={() => deleteDomain(domain.id)} 
                    style={styles.dangerButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={styles.card}>
        <h3>✨ One-Click Setup</h3>
        <p style={styles.helpText}>
          When you import a domain, we automatically:
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>✓ Create 4 email accounts (team@, hello@, contact@, info@)</div>
          <div style={styles.featureItem}>✓ Register with Resend for sending</div>
          <div style={styles.featureItem}>✓ Add DNS records to Cloudflare</div>
          <div style={styles.featureItem}>✓ Enable email routing</div>
          <div style={styles.featureItem}>✓ Deploy inbox worker for receiving</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WARMING PAGE
// ============================================
function WarmingPage() {
  const { authFetch } = useAuth();
  const [status, setStatus] = useState(null);
  const [emailsPerDay, setEmailsPerDay] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await authFetch('/api/warming/status');
      const data = await res.json();
      setStatus(data);
      setEmailsPerDay(data.status?.emails_per_day || 10);
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  const startWarming = async () => {
    setLoading(true);
    try {
      await authFetch('/api/warming/start', {
        method: 'POST',
        body: JSON.stringify({ emailsPerDay })
      });
      loadStatus();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoading(false);
  };

  const stopWarming = async () => {
    setLoading(true);
    try {
      await authFetch('/api/warming/stop', { method: 'POST' });
      loadStatus();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoading(false);
  };

  const updateConfig = async () => {
    try {
      await authFetch('/api/warming/config', {
        method: 'PUT',
        body: JSON.stringify({ emailsPerDay })
      });
      alert('Config updated!');
      loadStatus();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Email Warming</h2>
      
      <div style={styles.card}>
        <div style={styles.warmingHeader}>
          <h3>🔥 Auto Warming</h3>
          <span style={{
            ...styles.badge,
            backgroundColor: status?.status?.is_active ? '#10b981' : '#6b7280'
          }}>
            {status?.status?.is_active ? '● Active' : '○ Inactive'}
          </span>
        </div>
        
        <p style={styles.warmingDesc}>
          Automatically send emails between your domains to build reputation.
        </p>

        <div style={styles.configRow}>
          <label>Emails per day:</label>
          <input
            type="range"
            min="5"
            max="100"
            value={emailsPerDay}
            onChange={(e) => setEmailsPerDay(parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{emailsPerDay}</span>
        </div>

        <div style={styles.buttonRow}>
          {status?.status?.is_active ? (
            <>
              <button onClick={updateConfig} style={styles.secondaryButton}>
                Update Config
              </button>
              <button onClick={stopWarming} style={styles.dangerButton} disabled={loading}>
                {loading ? 'Stopping...' : 'Stop Warming'}
              </button>
            </>
          ) : (
            <button onClick={startWarming} style={styles.primaryButton} disabled={loading}>
              {loading ? 'Starting...' : 'Start Warming'}
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{status?.stats?.total_sent || 0}</div>
          <div style={styles.statLabel}>📤 Total Sent</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{status?.stats?.ai_generated || 0}</div>
          <div style={styles.statLabel}>🤖 AI Generated</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{status?.stats?.replies || 0}</div>
          <div style={styles.statLabel}>↩️ Replies</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{emailsPerDay}</div>
          <div style={styles.statLabel}>📅 Per Day</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Recent Activity</h3>
        {status?.recentEmails?.length > 0 ? (
          <div style={styles.emailList}>
            {status.recentEmails.map((email, i) => (
              <div key={i} style={styles.emailItem}>
                <span style={styles.emailIcon}>📤</span>
                <span style={styles.emailFrom}>{email.from_email}</span>
                <span style={styles.emailArrow}>→</span>
                <span style={styles.emailTo}>{email.to_email}</span>
                <span style={styles.emailSubject}>{email.subject}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No warming emails yet.</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// INBOX PAGE WITH THREADS & REPLY TRACKING
// ============================================
function InboxPage() {
  const { authFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyStats, setReplyStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('threads'); // 'threads' or 'messages'
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (viewMode === 'threads') {
      loadThreads();
    } else {
      loadInbox();
    }
  }, [filter, viewMode]);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/inbox?filter=${filter}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
      setReplyStats(data.replyStats || {});
    } catch (err) {
      console.error('Failed to load inbox:', err);
    }
    setLoading(false);
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/inbox/threads');
      const data = await res.json();
      setThreads(data.threads || []);
      
      // Also get unread count
      const inboxRes = await authFetch('/api/inbox?limit=1');
      const inboxData = await inboxRes.json();
      setUnreadCount(inboxData.unreadCount || 0);
      setReplyStats(inboxData.replyStats || {});
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
    setLoading(false);
  };

  const loadThreadMessages = async (threadId) => {
    try {
      const res = await authFetch(`/api/inbox/threads/${threadId}`);
      const data = await res.json();
      setThreadMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  const selectThread = (thread) => {
    setSelectedThread(thread);
    setSelectedMessage(null);
    loadThreadMessages(thread.thread_id);
  };

  const markAsRead = async (id) => {
    try {
      await authFetch(`/api/inbox/${id}/read`, { method: 'PUT' });
      loadInbox();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await authFetch('/api/inbox/mark-all-read', { method: 'POST' });
      if (viewMode === 'threads') {
        loadThreads();
      } else {
        loadInbox();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const selectMessage = (msg) => {
    setSelectedMessage(msg);
    setSelectedThread(null);
    if (!msg.is_read) {
      markAsRead(msg.id);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div style={styles.inboxHeader}>
        <h2 style={styles.pageTitle}>
          Inbox {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
        </h2>
        <div style={styles.inboxActions}>
          <div style={styles.viewToggle}>
            <button 
              onClick={() => setViewMode('threads')}
              style={{
                ...styles.toggleButton,
                backgroundColor: viewMode === 'threads' ? '#3b82f6' : '#334155'
              }}
            >
              Threads
            </button>
            <button 
              onClick={() => setViewMode('messages')}
              style={{
                ...styles.toggleButton,
                backgroundColor: viewMode === 'messages' ? '#3b82f6' : '#334155'
              }}
            >
              All
            </button>
          </div>
          {viewMode === 'messages' && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect}>
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="warming">Warming</option>
              <option value="replies">Replies Only</option>
            </select>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={styles.smallButton}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Reply Stats */}
      <div style={styles.replyStatsBar}>
        <div style={styles.replyStatItem}>
          <span style={styles.replyStatIcon}>↩️</span>
          <span>{replyStats.total_replies || 0} replies</span>
        </div>
        <div style={styles.replyStatItem}>
          <span style={styles.replyStatIcon}>🤖</span>
          <span>{replyStats.auto_replies || 0} auto-replies</span>
        </div>
      </div>

      <div style={styles.inboxContainer}>
        {/* Left Panel - Thread/Message List */}
        <div style={styles.messageList}>
          {loading ? (
            <p style={styles.emptyText}>Loading...</p>
          ) : viewMode === 'threads' ? (
            threads.length === 0 ? (
              <p style={styles.emptyText}>No threads yet. Start warming to see activity.</p>
            ) : (
              threads.map(thread => (
                <div
                  key={thread.id}
                  style={{
                    ...styles.threadItem,
                    backgroundColor: selectedThread?.id === thread.id ? 'rgba(59, 130, 246, 0.15)' : 
                      thread.unread_count > 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderLeft: selectedThread?.id === thread.id ? '3px solid #3b82f6' : '3px solid transparent'
                  }}
                  onClick={() => selectThread(thread)}
                >
                  <div style={styles.threadHeader}>
                    <span style={styles.threadParticipants}>
                      {thread.participants?.slice(0, 2).map(p => p.split('@')[0]).join(', ')}
                    </span>
                    {thread.unread_count > 0 && (
                      <span style={styles.threadUnread}>{thread.unread_count}</span>
                    )}
                  </div>
                  <div style={styles.threadSubject}>{thread.subject}</div>
                  <div style={styles.threadMeta}>
                    <span>{thread.message_count} messages</span>
                    <span>•</span>
                    <span>{formatTime(thread.last_message_at)}</span>
                    {thread.is_warming && <span style={styles.warmingTag}>🔥</span>}
                  </div>
                </div>
              ))
            )
          ) : (
            messages.length === 0 ? (
              <p style={styles.emptyText}>No messages yet.</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageItem,
                    backgroundColor: msg.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                    borderLeft: selectedMessage?.id === msg.id ? '3px solid #3b82f6' : '3px solid transparent'
                  }}
                  onClick={() => selectMessage(msg)}
                >
                  <div style={styles.messageHeader}>
                    <span style={styles.messageType}>
                      {msg.message_type === 'auto_reply' ? '↩️' : msg.message_type === 'sent' ? '📤' : '📥'}
                    </span>
                    <span style={styles.messageFrom}>{msg.from_email}</span>
                    {msg.is_warming && <span style={styles.warmingTag}>🔥</span>}
                    {msg.reply_count > 0 && (
                      <span style={styles.replyBadge}>+{msg.reply_count}</span>
                    )}
                  </div>
                  <div style={styles.messageSubject}>
                    {msg.message_type === 'auto_reply' && 'Re: '}{msg.subject}
                  </div>
                  <div style={styles.messagePreview}>
                    {msg.body?.substring(0, 60)}...
                  </div>
                  <div style={styles.messageTime}>{formatTime(msg.created_at)}</div>
                </div>
              ))
            )
          )}
        </div>

        {/* Right Panel - Detail View */}
        <div style={styles.messageDetail}>
          {selectedThread ? (
            <div style={styles.threadView}>
              <div style={styles.threadViewHeader}>
                <h3>{selectedThread.subject}</h3>
                <div style={styles.threadViewMeta}>
                  {selectedThread.message_count} messages in thread
                </div>
              </div>
              <div style={styles.threadMessages}>
                {threadMessages.map((msg, idx) => (
                  <div 
                    key={msg.id} 
                    style={{
                      ...styles.threadMessage,
                      backgroundColor: msg.message_type === 'auto_reply' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <div style={styles.threadMessageHeader}>
                      <span style={styles.threadMessageType}>
                        {msg.message_type === 'auto_reply' ? '↩️ Auto-reply' : '📤 Sent'}
                      </span>
                      <span style={styles.threadMessageFrom}>{msg.from_email}</span>
                      <span style={styles.threadMessageTime}>{formatTime(msg.created_at)}</span>
                    </div>
                    <div style={styles.threadMessageBody}>{msg.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedMessage ? (
            <>
              <div style={styles.detailHeader}>
                <div style={styles.detailType}>
                  {selectedMessage.message_type === 'auto_reply' ? '↩️ Auto-Reply' : '📤 Sent'}
                  {selectedMessage.reply_count > 0 && (
                    <span style={styles.replyIndicator}>
                      ✓ {selectedMessage.reply_count} {selectedMessage.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
                <h3>{selectedMessage.subject}</h3>
                <div style={styles.detailMeta}>
                  <div><strong>From:</strong> {selectedMessage.from_email}</div>
                  <div><strong>To:</strong> {selectedMessage.to_email}</div>
                  <div><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</div>
                  {selectedMessage.replied_at && (
                    <div style={styles.repliedAt}>
                      <strong>Replied:</strong> {new Date(selectedMessage.replied_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.detailBody}>
                {selectedMessage.body}
              </div>
            </>
          ) : (
            <div style={styles.emptyDetail}>
              <div style={styles.emptyIcon}>📬</div>
              <p>Select a {viewMode === 'threads' ? 'thread' : 'message'} to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CAMPAIGNS PAGE
// ============================================
function CampaignsPage() {
  const { authFetch } = useAuth();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await authFetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Campaigns</h2>
      <div style={styles.card}>
        <p style={styles.emptyText}>
          Campaign management coming soon. For now, focus on warming your domains to improve deliverability.
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
function App() {
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'domains': return <DomainsPage />;
      case 'warming': return <WarmingPage />;
      case 'inbox': return <InboxPage />;
      case 'campaigns': return <CampaignsPage />;
      default: return <DashboardPage />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'domains', label: '🌐 Domains' },
    { id: 'warming', label: '🔥 Warming' },
    { id: 'inbox', label: '📥 Inbox' },
    { id: 'campaigns', label: '📧 Campaigns' }
  ];

  return (
    <div style={styles.app}>
      <nav style={styles.sidebar}>
        <div style={styles.logo}>🦈 Shark Email</div>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              ...styles.navItem,
              backgroundColor: currentPage === item.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
            }}
          >
            {item.label}
          </button>
        ))}
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>
      <main style={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0'
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1e293b',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    padding: '10px'
  },
  navItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    textAlign: 'left',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#e2e8f0',
    fontSize: '15px',
    marginBottom: '4px',
    transition: 'background 0.2s'
  },
  logoutButton: {
    marginTop: 'auto',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto'
  },
  pageTitle: {
    fontSize: '28px',
    marginBottom: '24px',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  statLabel: {
    color: '#94a3b8',
    marginTop: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    marginBottom: '12px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  smallButton: {
    padding: '8px 16px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  dangerButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a'
  },
  loginCard: {
    backgroundColor: '#1e293b',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px'
  },
  loginTitle: {
    textAlign: 'center',
    fontSize: '32px',
    marginBottom: '8px',
    color: '#e2e8f0'
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '30px'
  },
  error: {
    color: '#ef4444',
    marginBottom: '12px',
    fontSize: '14px'
  },
  switchAuth: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#94a3b8'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white'
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: '20px'
  },
  emailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  emailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    fontSize: '14px'
  },
  emailIcon: {
    fontSize: '16px'
  },
  emailFrom: {
    color: '#3b82f6',
    fontWeight: '500'
  },
  emailArrow: {
    color: '#64748b'
  },
  emailTo: {
    color: '#10b981'
  },
  emailSubject: {
    color: '#94a3b8',
    marginLeft: 'auto'
  },
  domainList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  domainCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155'
  },
  domainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  domainBadges: {
    display: 'flex',
    gap: '8px'
  },
  domainStatus: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0'
  },
  statusLabel: {
    color: '#94a3b8'
  },
  statusOk: {
    color: '#10b981'
  },
  statusPending: {
    color: '#f59e0b'
  },
  actionButton: {
    padding: '8px 14px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  helpText: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '8px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  importList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px'
  },
  importItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    borderRadius: '8px'
  },
  importInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  importName: {
    fontWeight: '500',
    fontSize: '15px'
  },
  importButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  setupLog: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#0f172a',
    borderRadius: '8px'
  },
  setupLogItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #1e293b'
  },
  setupLogIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center'
  },
  setupLogStep: {
    fontWeight: '500',
    minWidth: '120px'
  },
  setupLogMessage: {
    color: '#94a3b8',
    fontSize: '13px'
  },
  featureList: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureItem: {
    color: '#94a3b8',
    fontSize: '14px',
    paddingLeft: '8px'
  },
  domainItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#0f172a',
    borderRadius: '8px'
  },
  domainName: {
    fontWeight: '500',
    fontSize: '16px'
  },
  addDomainForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  warmingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  warmingDesc: {
    color: '#94a3b8',
    marginBottom: '20px'
  },
  configRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  slider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px'
  },
  sliderValue: {
    backgroundColor: '#334155',
    padding: '4px 12px',
    borderRadius: '4px',
    minWidth: '40px',
    textAlign: 'center'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0'
  },
  // Inbox styles
  inboxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  inboxActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  filterSelect: {
    padding: '8px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#e2e8f0'
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '14px',
    marginLeft: '8px'
  },
  inboxContainer: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '20px',
    height: 'calc(100vh - 150px)'
  },
  messageList: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    overflowY: 'auto',
    padding: '8px'
  },
  messageItem: {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'background 0.2s'
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  messageType: {
    fontSize: '14px'
  },
  messageFrom: {
    fontSize: '13px',
    color: '#94a3b8',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  warmingTag: {
    fontSize: '12px'
  },
  messageSubject: {
    fontWeight: '500',
    fontSize: '14px',
    marginBottom: '4px'
  },
  messagePreview: {
    fontSize: '13px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  messageTime: {
    fontSize: '11px',
    color: '#475569',
    marginTop: '4px'
  },
  messageDetail: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    overflowY: 'auto'
  },
  detailHeader: {
    borderBottom: '1px solid #334155',
    paddingBottom: '16px',
    marginBottom: '16px'
  },
  detailMeta: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailBody: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  },
  emptyDetail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  // Thread & Reply styles
  viewToggle: {
    display: 'flex',
    gap: '4px'
  },
  toggleButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px'
  },
  replyStatsBar: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  },
  replyStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  replyStatIcon: {
    fontSize: '16px'
  },
  threadItem: {
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'background 0.2s'
  },
  threadHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  threadParticipants: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0'
  },
  threadUnread: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '500'
  },
  threadSubject: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '4px'
  },
  threadMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#64748b'
  },
  replyBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '500'
  },
  threadView: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  threadViewHeader: {
    borderBottom: '1px solid #334155',
    paddingBottom: '16px',
    marginBottom: '16px'
  },
  threadViewMeta: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '8px'
  },
  threadMessages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  threadMessage: {
    padding: '16px',
    borderRadius: '8px'
  },
  threadMessageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '13px'
  },
  threadMessageType: {
    fontWeight: '500'
  },
  threadMessageFrom: {
    color: '#94a3b8'
  },
  threadMessageTime: {
    marginLeft: 'auto',
    color: '#64748b',
    fontSize: '12px'
  },
  threadMessageBody: {
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  detailType: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  replyIndicator: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  repliedAt: {
    color: '#10b981'
  }
};

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
