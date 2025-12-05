import React, { useState, useEffect } from 'react';
import { Menu, Home, Flame, Users as UsersIcon, Mail, Settings, Shield } from 'lucide-react';
import { AuthProvider, useAuth, LoginPage, UserManagement, LogoutButton } from './AuthComponents';

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = 'https://cold-email-system-1.onrender.com';

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
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        <TopBar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {renderPage(currentPage)}
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// PAGE ROUTER
// =============================================================================

function renderPage(page) {
  switch (page) {
    case 'dashboard':
      return <Dashboard />;
    case 'warming':
      return <WarmingPage />;
    case 'contacts':
      return <ContactsPage />;
    case 'campaigns':
      return <CampaignsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'users':
      return <UserManagement />;
    default:
      return <Dashboard />;
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

  // Filter nav items based on role
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
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6b7280';
                }
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
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          background: '#f9fafb',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#111827'
          }}>
            {user.name}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
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

function TopBar({ setSidebarOpen }) {
  const [systemStatus, setSystemStatus] = useState(null);

  // Fetch system health
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch health:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Every 30s
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
        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.background = 'none'}
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
            background: '#d1fae5',
            borderRadius: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#065f46'
            }}>
              System Online
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

function Dashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon={Mail}
          label="Active Campaigns"
          value={stats?.campaigns || 0}
          color="#667eea"
          loading={loading}
        />
        <StatCard
          icon={Flame}
          label="Warming Accounts"
          value={stats?.warmingAccounts || 0}
          color="#f59e0b"
          loading={loading}
        />
        <StatCard
          icon={UsersIcon}
          label="Total Contacts"
          value={0}
          color="#10b981"
          loading={loading}
        />
        <StatCard
          icon={Mail}
          label="Emails Sent"
          value={0}
          color="#3b82f6"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
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
          />
          <QuickActionCard
            icon={UsersIcon}
            title="Import Contacts"
            description="Upload contact list"
          />
          <QuickActionCard
            icon={Mail}
            title="New Campaign"
            description="Create email campaign"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
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
      <p style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '4px'
      }}>
        {loading ? '...' : value}
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        {label}
      </p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description }) {
  return (
    <div style={{
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
    }}>
      <Icon size={24} color="#667eea" style={{ marginBottom: '12px' }} />
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '4px'
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7280' }}>
        {description}
      </p>
    </div>
  );
}

// =============================================================================
// WARMING PAGE
// =============================================================================

function WarmingPage() {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/warming/accounts`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [getToken]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Email Warming
        </h1>
        <p style={{ color: '#6b7280' }}>
          Gradually warm up your email accounts to improve deliverability
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '60px',
        textAlign: 'center'
      }}>
        <Flame size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          {loading ? 'Loading...' : accounts.length === 0 ? 'No Warming Accounts Yet' : `${accounts.length} Warming Account${accounts.length > 1 ? 's' : ''}`}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {loading ? 'Fetching your warming accounts...' : accounts.length === 0 ? 'Add your first email account to start warming' : 'Manage your warming accounts'}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// CONTACTS PAGE
// =============================================================================

function ContactsPage() {
  const { getToken } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contacts`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [getToken]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Contacts
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your contact lists and segments
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '60px',
        textAlign: 'center'
      }}>
        <UsersIcon size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          {loading ? 'Loading...' : contacts.length === 0 ? 'No Contacts Yet' : `${contacts.length} Contact${contacts.length > 1 ? 's' : ''}`}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {loading ? 'Fetching your contacts...' : contacts.length === 0 ? 'Import your first contact list' : 'Manage your contacts'}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// CAMPAIGNS PAGE
// =============================================================================

function CampaignsPage() {
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [getToken]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Campaigns
        </h1>
        <p style={{ color: '#6b7280' }}>
          Create and manage your email campaigns
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '60px',
        textAlign: 'center'
      }}>
        <Mail size={48} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          {loading ? 'Loading...' : campaigns.length === 0 ? 'No Campaigns Yet' : `${campaigns.length} Campaign${campaigns.length > 1 ? 's' : ''}`}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {loading ? 'Fetching your campaigns...' : campaigns.length === 0 ? 'Create your first email campaign' : 'Manage your campaigns'}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// SETTINGS PAGE
// =============================================================================

function SettingsPage() {
  const [settings, setSettings] = useState({
    senderName: '',
    emailSignature: '',
    timezone: 'UTC'
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280' }}>
          Configure your system preferences
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Default Sender Name
          </label>
          <input
            type="text"
            value={settings.senderName}
            onChange={(e) => setSettings({...settings, senderName: e.target.value})}
            placeholder="Your Name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Email Signature
          </label>
          <textarea
            value={settings.emailSignature}
            onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
            placeholder="Best regards,&#10;Your Name"
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
          </select>
        </div>

        <div style={{
          padding: '16px',
          background: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          💡 Settings are stored locally in your browser.
        </div>
      </div>
    </div>
  );
}
