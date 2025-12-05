import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, Home, Flame, Users as UsersIcon, Mail, Settings, Shield, 
  Plus, Trash2, Play, Pause, Upload, Download, Search, Filter,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Eye, Clock,
  ChevronDown, ChevronUp, Edit, Copy, X, Check
} from 'lucide-react';
import { AuthProvider, useAuth, LoginPage, UserManagement, LogoutButton } from './AuthComponents';

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = 'https://cold-email-system-1.onrender.com';

// Helper function for authenticated API calls
async function apiCall(endpoint, options = {}, token) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// =============================================================================
// APP CONTENT (Authenticated)
// =============================================================================

function AppContent() {
  const { user, loading, isAdmin, getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Main app layout
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        isAdmin={isAdmin}
        user={user}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <TopBar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <PageContent 
            page={currentPage} 
            showNotification={showNotification}
            getToken={getToken}
          />
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// NOTIFICATION COMPONENT
// =============================================================================

function Notification({ message, type, onClose }) {
  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
  };
  
  const color = colors[type] || colors.info;
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      zIndex: 9999,
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease'
    }}>
      <Icon size={20} color={color.text} />
      <span style={{ color: color.text, fontSize: '14px', fontWeight: '500', flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          color: color.text
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// =============================================================================
// PAGE ROUTER
// =============================================================================

function PageContent({ page, showNotification, getToken }) {
  switch (page) {
    case 'dashboard':
      return <Dashboard getToken={getToken} />;
    case 'warming':
      return <WarmingPage getToken={getToken} showNotification={showNotification} />;
    case 'contacts':
      return <ContactsPage getToken={getToken} showNotification={showNotification} />;
    case 'campaigns':
      return <CampaignsPage getToken={getToken} showNotification={showNotification} />;
    case 'settings':
      return <SettingsPage showNotification={showNotification} />;
    case 'users':
      return <UserManagement />;
    default:
      return <Dashboard getToken={getToken} />;
  }
}

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

function Sidebar({ currentPage, setCurrentPage, sidebarOpen, isAdmin, user }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'warming', icon: Flame, label: 'Warming' },
    { id: 'contacts', icon: UsersIcon, label: 'Contacts' },
    { id: 'campaigns', icon: Mail, label: 'Campaigns' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'users', icon: Shield, label: 'Users', adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin());

  if (!sidebarOpen) return null;

  return (
    <div style={{
      width: '260px',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <Mail size={20} color="white" />
        </div>
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Cold Email</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                background: isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.adminOnly && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#ede9fe',
                  color: isActive ? 'white' : '#7c3aed'
                }}>
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#111827' }}>
            {user.name}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            {user.email}
          </p>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            background: user.role === 'admin' ? '#ede9fe' : '#f3f4f6',
            color: user.role === 'admin' ? '#7c3aed' : '#6b7280'
          }}>
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOP BAR COMPONENT
// =============================================================================

function TopBar({ setSidebarOpen, sidebarOpen }) {
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
        }
      } catch (error) {
        setSystemStatus({ status: 'error' });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    }}>
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        style={{
          padding: '8px',
          background: 'none',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: '#6b7280'
        }}
      >
        <Menu size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {systemStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: systemStatus.status === 'ok' ? '#d1fae5' : '#fee2e2',
            borderRadius: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: systemStatus.status === 'ok' ? '#10b981' : '#ef4444'
            }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '500',
              color: systemStatus.status === 'ok' ? '#065f46' : '#991b1b'
            }}>
              {systemStatus.status === 'ok' ? 'System Online' : 'System Error'}
            </span>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

function Dashboard({ getToken }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const [health, warmingRes, contactsRes, campaignsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/health`).then(r => r.json()),
          apiCall('/api/warming/accounts', {}, token).catch(() => ({ accounts: [] })),
          apiCall('/api/contacts', {}, token).catch(() => ({ contacts: [] })),
          apiCall('/api/campaigns', {}, token).catch(() => ({ campaigns: [] }))
        ]);

        setStats({
          campaigns: campaignsRes.campaigns?.length || 0,
          warmingAccounts: warmingRes.accounts?.length || 0,
          contacts: contactsRes.contacts?.length || 0,
          emailsSent: health.emailsSent || 0
        });

        // Create recent activity from data
        const activities = [];
        if (warmingRes.accounts?.length > 0) {
          activities.push({ type: 'warming', message: `${warmingRes.accounts.length} warming account(s) configured` });
        }
        if (contactsRes.contacts?.length > 0) {
          activities.push({ type: 'contacts', message: `${contactsRes.contacts.length} contact(s) in database` });
        }
        if (campaignsRes.campaigns?.length > 0) {
          activities.push({ type: 'campaigns', message: `${campaignsRes.campaigns.length} campaign(s) created` });
        }
        setRecentActivity(activities);

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Welcome to your cold email campaign manager
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon={Mail}
          label="Campaigns"
          value={loading ? '...' : stats?.campaigns || 0}
          color="#667eea"
          subtitle="Total created"
        />
        <StatCard
          icon={Flame}
          label="Warming Accounts"
          value={loading ? '...' : stats?.warmingAccounts || 0}
          color="#f59e0b"
          subtitle="Active accounts"
        />
        <StatCard
          icon={UsersIcon}
          label="Contacts"
          value={loading ? '...' : stats?.contacts || 0}
          color="#10b981"
          subtitle="In database"
        />
        <StatCard
          icon={Send}
          label="Emails Sent"
          value={loading ? '...' : stats?.emailsSent || 0}
          color="#3b82f6"
          subtitle="Total sent"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <QuickActionCard
            icon={Flame}
            title="Add Warming Account"
            description="Configure email warming"
            color="#f59e0b"
          />
          <QuickActionCard
            icon={Upload}
            title="Import Contacts"
            description="Upload CSV file"
            color="#10b981"
          />
          <QuickActionCard
            icon={Mail}
            title="New Campaign"
            description="Create email campaign"
            color="#667eea"
          />
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            System Status
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <CheckCircle size={18} color="#10b981" />
                <span style={{ fontSize: '14px', color: '#374151' }}>{activity.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      transition: 'all 0.2s'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>
      <p style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}>
        {value}
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>{label}</p>
      {subtitle && <p style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</p>}
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, color }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px'
      }}>
        <Icon size={20} color={color} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#111827' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7280' }}>{description}</p>
    </div>
  );
}

// =============================================================================
// WARMING PAGE
// =============================================================================

function WarmingPage({ getToken, showNotification }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await apiCall('/api/warming/accounts', {}, getToken());
      setAccounts(data.accounts || []);
    } catch (error) {
      showNotification('Failed to fetch accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [getToken, showNotification]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await apiCall(`/api/warming/accounts/${id}`, { method: 'DELETE' }, getToken());
      showNotification('Account deleted successfully', 'success');
      fetchAccounts();
    } catch (error) {
      showNotification('Failed to delete account', 'error');
    }
  };

  const handleTest = async (account) => {
    setTestingId(account.id);
    try {
      await apiCall('/api/smtp/test', {
        method: 'POST',
        body: JSON.stringify({
          smtp_host: account.smtp_host,
          smtp_port: account.smtp_port,
          smtp_user: account.smtp_user,
          smtp_pass: account.smtp_pass
        })
      }, getToken());
      showNotification('SMTP connection successful!', 'success');
    } catch (error) {
      showNotification(`SMTP test failed: ${error.message}`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  const startWarming = async () => {
    try {
      const result = await apiCall('/api/warming/start', { method: 'POST' }, getToken());
      showNotification(`Warming round completed! ${result.emailsSent} emails sent.`, 'success');
    } catch (error) {
      showNotification(`Warming failed: ${error.message}`, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Email Warming</h1>
          <p style={{ color: '#6b7280' }}>Warm up your email accounts to improve deliverability</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {accounts.length > 1 && (
            <button
              onClick={startWarming}
              style={{
                padding: '12px 24px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={18} /> Start Warming
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} /> Add Account
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading warming accounts..." />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No Warming Accounts Yet"
          description="Add your first email account to start warming. You need at least 2 accounts for warming to work."
          action={{ label: 'Add Account', onClick: () => setShowAddModal(true) }}
        />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {accounts.map(account => (
            <div
              key={account.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{account.email}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    SMTP: {account.smtp_host}:{account.smtp_port} • IMAP: {account.imap_host}:{account.imap_port}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: account.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: account.status === 'active' ? '#065f46' : '#991b1b'
                  }}>
                    {account.status}
                  </span>
                  <button
                    onClick={() => handleTest(account)}
                    disabled={testingId === account.id}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {testingId === account.id ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={14} />}
                    {testingId === account.id ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    style={{
                      padding: '8px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddWarmingAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAccounts();
            showNotification('Account added successfully!', 'success');
          }}
          getToken={getToken}
        />
      )}
    </div>
  );
}

function AddWarmingAccountModal({ onClose, onSuccess, getToken }) {
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
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiCall('/api/warming/accounts', {
        method: 'POST',
        body: JSON.stringify(form)
      }, getToken());
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Warming Account" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        
        <FormField label="Email Address" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="your@email.com"
            required
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="SMTP Host" required>
            <input
              type="text"
              value={form.smtp_host}
              onChange={(e) => setForm({...form, smtp_host: e.target.value})}
              placeholder="smtp.gmail.com"
              required
              style={inputStyle}
            />
          </FormField>
          <FormField label="SMTP Port" required>
            <input
              type="number"
              value={form.smtp_port}
              onChange={(e) => setForm({...form, smtp_port: parseInt(e.target.value)})}
              placeholder="587"
              required
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="SMTP Username" required>
          <input
            type="text"
            value={form.smtp_user}
            onChange={(e) => setForm({...form, smtp_user: e.target.value})}
            placeholder="your@email.com"
            required
            style={inputStyle}
          />
        </FormField>

        <FormField label="SMTP Password" required>
          <input
            type="password"
            value={form.smtp_pass}
            onChange={(e) => setForm({...form, smtp_pass: e.target.value})}
            placeholder="App password or SMTP password"
            required
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="IMAP Host" required>
            <input
              type="text"
              value={form.imap_host}
              onChange={(e) => setForm({...form, imap_host: e.target.value})}
              placeholder="imap.gmail.com"
              required
              style={inputStyle}
            />
          </FormField>
          <FormField label="IMAP Port" required>
            <input
              type="number"
              value={form.imap_port}
              onChange={(e) => setForm({...form, imap_port: parseInt(e.target.value)})}
              placeholder="993"
              required
              style={inputStyle}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>
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

  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiCall('/api/contacts', {}, getToken());
      setContacts(data.contacts || []);
    } catch (error) {
      showNotification('Failed to fetch contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, [getToken, showNotification]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter(contact =>
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Contacts</h1>
          <p style={{ color: '#6b7280' }}>Manage your contact lists ({contacts.length} total)</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Upload size={18} /> Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      {contacts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: '40px'
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading contacts..." />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No Contacts Yet"
          description="Add contacts manually or import from a CSV file to get started."
          action={{ label: 'Add Contact', onClick: () => setShowAddModal(true) }}
        />
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Company</th>
                <th style={tableHeaderStyle}>Title</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr key={contact.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tableCellStyle}>
                    {contact.first_name || contact.last_name 
                      ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                      : '-'}
                  </td>
                  <td style={tableCellStyle}>{contact.email}</td>
                  <td style={tableCellStyle}>{contact.company || '-'}</td>
                  <td style={tableCellStyle}>{contact.title || '-'}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: contact.status === 'active' ? '#d1fae5' : '#fee2e2',
                      color: contact.status === 'active' ? '#065f46' : '#991b1b'
                    }}>
                      {contact.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchContacts();
            showNotification('Contact added successfully!', 'success');
          }}
          getToken={getToken}
        />
      )}

      {showImportModal && (
        <ImportContactsModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(count) => {
            setShowImportModal(false);
            fetchContacts();
            showNotification(`${count} contacts imported successfully!`, 'success');
          }}
          getToken={getToken}
        />
      )}
    </div>
  );
}

function AddContactModal({ onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    title: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiCall('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(form)
      }, getToken());
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Contact" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        
        <FormField label="Email Address" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="contact@company.com"
            required
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name">
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({...form, first_name: e.target.value})}
              placeholder="John"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Last Name">
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({...form, last_name: e.target.value})}
              placeholder="Doe"
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="Company">
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({...form, company: e.target.value})}
            placeholder="Acme Inc"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="CEO"
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ImportContactsModal({ onClose, onSuccess, getToken }) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const contact = {};
      
      headers.forEach((header, index) => {
        if (header.includes('email')) contact.email = values[index];
        else if (header.includes('first')) contact.first_name = values[index];
        else if (header.includes('last')) contact.last_name = values[index];
        else if (header.includes('company')) contact.company = values[index];
        else if (header.includes('title') || header.includes('position')) contact.title = values[index];
      });
      
      if (contact.email) contacts.push(contact);
    }
    
    return contacts;
  };

  const handleTextChange = (text) => {
    setCsvText(text);
    const contacts = parseCSV(text);
    setPreview(contacts.slice(0, 5));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleTextChange(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const contacts = parseCSV(csvText);
    if (contacts.length === 0) {
      setError('No valid contacts found in CSV');
      setLoading(false);
      return;
    }

    try {
      const result = await apiCall('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(contacts)
      }, getToken());
      onSuccess(result.count || contacts.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Import Contacts from CSV" onClose={onClose} wide>
      {error && <ErrorMessage message={error} />}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#f3f4f6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Upload size={18} /> Choose CSV File
        </label>
      </div>

      <FormField label="Or paste CSV content">
        <textarea
          value={csvText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="email,first_name,last_name,company,title&#10;john@acme.com,John,Doe,Acme Inc,CEO"
          rows={8}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px' }}
        />
      </FormField>

      {preview.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Preview ({preview.length} of {parseCSV(csvText).length} contacts):
          </p>
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', fontSize: '13px' }}>
            {preview.map((contact, i) => (
              <div key={i} style={{ marginBottom: i < preview.length - 1 ? '8px' : 0 }}>
                {contact.email} - {contact.first_name} {contact.last_name} {contact.company ? `(${contact.company})` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
        <button 
          onClick={handleSubmit} 
          disabled={loading || parseCSV(csvText).length === 0} 
          style={primaryButtonStyle}
        >
          {loading ? 'Importing...' : `Import ${parseCSV(csvText).length} Contacts`}
        </button>
      </div>
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

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await apiCall('/api/campaigns', {}, getToken());
      setCampaigns(data.campaigns || []);
    } catch (error) {
      showNotification('Failed to fetch campaigns', 'error');
    } finally {
      setLoading(false);
    }
  }, [getToken, showNotification]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleStatusChange = async (id, action) => {
    try {
      await apiCall(`/api/campaigns/${id}/${action}`, { method: 'POST' }, getToken());
      showNotification(`Campaign ${action === 'start' ? 'started' : 'stopped'} successfully!`, 'success');
      fetchCampaigns();
    } catch (error) {
      showNotification(`Failed to ${action} campaign`, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Campaigns</h1>
          <p style={{ color: '#6b7280' }}>Create and manage your email campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading campaigns..." />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No Campaigns Yet"
          description="Create your first email campaign to start reaching out to your contacts."
          action={{ label: 'Create Campaign', onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{campaign.name}</h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: campaign.status === 'sending' ? '#dbeafe' : 
                                 campaign.status === 'sent' ? '#d1fae5' : 
                                 campaign.status === 'paused' ? '#fef3c7' : '#f3f4f6',
                      color: campaign.status === 'sending' ? '#1e40af' : 
                             campaign.status === 'sent' ? '#065f46' : 
                             campaign.status === 'paused' ? '#92400e' : '#6b7280'
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    Subject: {campaign.subject}
                  </p>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                    From: {campaign.from_name} &lt;{campaign.from_email}&gt;
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'start')}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Play size={14} /> Start
                    </button>
                  )}
                  {campaign.status === 'sending' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'stop')}
                      style={{
                        padding: '8px 16px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Pause size={14} /> Pause
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    {campaign.total_recipients || 0}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Recipients</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    {campaign.emails_sent || 0}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Sent</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {campaign.emails_opened || 0}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Opened</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {campaign.emails_clicked || 0}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Clicked</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
            showNotification('Campaign created successfully!', 'success');
          }}
          getToken={getToken}
        />
      )}
    </div>
  );
}

function CreateCampaignModal({ onClose, onSuccess, getToken }) {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    from_name: '',
    from_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiCall('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(form)
      }, getToken());
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create Campaign" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        <FormField label="Campaign Name" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Q4 Outreach Campaign"
            required
            style={inputStyle}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="From Name" required>
            <input
              type="text"
              value={form.from_name}
              onChange={(e) => setForm({...form, from_name: e.target.value})}
              placeholder="John from Acme"
              required
              style={inputStyle}
            />
          </FormField>
          <FormField label="From Email" required>
            <input
              type="email"
              value={form.from_email}
              onChange={(e) => setForm({...form, from_email: e.target.value})}
              placeholder="john@acme.com"
              required
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="Subject Line" required>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({...form, subject: e.target.value})}
            placeholder="Quick question about {{company}}"
            required
            style={inputStyle}
          />
        </FormField>

        <FormField label="Email Body" required>
          <textarea
            value={form.body}
            onChange={(e) => setForm({...form, body: e.target.value})}
            placeholder="Hi {{first_name}},&#10;&#10;I noticed that {{company}} is doing great things in...&#10;&#10;Best,&#10;John"
            required
            rows={10}
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </FormField>

        <div style={{
          padding: '12px 16px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6b7280',
          marginTop: '16px'
        }}>
          💡 Use variables like {'{{first_name}}'}, {'{{last_name}}'}, {'{{company}}'}, {'{{title}}'} to personalize emails
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// SETTINGS PAGE
// =============================================================================

function SettingsPage({ showNotification }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('emailSettings');
    return saved ? JSON.parse(saved) : {
      senderName: '',
      emailSignature: '',
      timezone: 'UTC',
      dailyLimit: 50,
      sendingDelay: 60
    };
  });

  const handleSave = () => {
    localStorage.setItem('emailSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#6b7280' }}>Configure your system preferences</p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        maxWidth: '600px'
      }}>
        <FormField label="Default Sender Name">
          <input
            type="text"
            value={settings.senderName}
            onChange={(e) => setSettings({...settings, senderName: e.target.value})}
            placeholder="Your Name"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Email Signature">
          <textarea
            value={settings.emailSignature}
            onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
            placeholder="Best regards,&#10;Your Name&#10;Your Title"
            rows={4}
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </FormField>

        <FormField label="Timezone">
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            style={inputStyle}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
          </select>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Daily Email Limit">
            <input
              type="number"
              value={settings.dailyLimit}
              onChange={(e) => setSettings({...settings, dailyLimit: parseInt(e.target.value)})}
              min={1}
              max={500}
              style={inputStyle}
            />
          </FormField>
          <FormField label="Delay Between Emails (seconds)">
            <input
              type="number"
              value={settings.sendingDelay}
              onChange={(e) => setSettings({...settings, sendingDelay: parseInt(e.target.value)})}
              min={10}
              max={300}
              style={inputStyle}
            />
          </FormField>
        </div>

        <button onClick={handleSave} style={{ ...primaryButtonStyle, marginTop: '24px' }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: wide ? '700px' : '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
        color: '#374151'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div style={{
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      color: '#991b1b',
      fontSize: '14px'
    }}>
      {message}
    </div>
  );
}

function LoadingState({ message }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '60px',
      textAlign: 'center'
    }}>
      <RefreshCw size={32} color="#6b7280" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>{message}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '60px',
      textAlign: 'center'
    }}>
      <Icon size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
        {description}
      </p>
      {action && (
        <button onClick={action.onClick} style={primaryButtonStyle}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          {action.label}
        </button>
      )}
    </div>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const primaryButtonStyle = {
  flex: 1,
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const secondaryButtonStyle = {
  flex: 1,
  padding: '12px 24px',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};

const tableHeaderStyle = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tableCellStyle = {
  padding: '16px 20px',
  fontSize: '14px',
  color: '#374151'
};
