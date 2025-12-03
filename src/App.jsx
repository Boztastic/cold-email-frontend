import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Flame, Users, Mail, Settings, Plus, Upload, Play, Pause, Trash2, Edit, Download, Search, Filter, BarChart3, AlertCircle, CheckCircle, Clock, Send, Eye, MousePointer, Reply, Shield, LogOut } from 'lucide-react';
import { AuthProvider, useAuth, LoginPage, UserManagement, LogoutButton } from './AuthComponents';

// API Configuration
const API_BASE_URL = 'https://cold-email-system-1.onrender.com';

// Main App Component with Authentication
export default function ColdEmailMVP() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App Content (authenticated)
function AppContent() {
  const { user, loading, token, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Fetch system stats (public endpoint - no auth needed)
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={stats} token={token} />;
      case 'warming':
        return <Warming token={token} />;
      case 'contacts':
        return <Contacts token={token} />;
      case 'campaigns':
        return <Campaigns token={token} />;
      case 'settings':
        return <SettingsPage token={token} />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard stats={stats} token={token} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={isAdmin}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          setSidebarOpen={setSidebarOpen}
          stats={stats}
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// Helper function to safely fetch with auth
async function safeFetch(url, token, options = {}) {
  try {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, { ...options, headers });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Backend not ready for this endpoint
      console.warn('Backend endpoint not ready:', url);
      return { error: 'Backend authentication not configured yet', accounts: [], contacts: [], campaigns: [] };
    }
  } catch (error) {
    console.error('API call failed:', url, error);
    return { error: error.message, accounts: [], contacts: [], campaigns: [] };
  }
}

// Sidebar Component
function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, isAdmin, user }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'warming', icon: Flame, label: 'Warming' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'campaigns', icon: Mail, label: 'Campaigns' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'users', icon: Shield, label: 'Users', adminOnly: true },
  ];

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin());

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">Cold Email</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.adminOnly && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-1">
            {user.name}
          </p>
          <p className="text-xs text-purple-600 mb-2">{user.email}</p>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'admin' 
                ? 'bg-purple-200 text-purple-800' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Bar Component
function TopBar({ setSidebarOpen, stats, user }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-4">
        {stats && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 font-medium">System Online</span>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ stats, token }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your cold email campaigns</p>
      </div>

      {/* Backend Auth Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Backend Authentication Not Configured</p>
            <p className="text-xs text-yellow-700 mt-1">
              Some features require backend authentication to be set up. Follow the AUTH_INTEGRATION_GUIDE.txt to enable full functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Mail}
          label="Active Campaigns"
          value={stats?.campaigns || 0}
          color="purple"
        />
        <StatCard
          icon={Flame}
          label="Warming Campaigns"
          value={stats?.warmingCampaigns || 0}
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          label="Warm Accounts"
          value={stats?.warmingAccounts || 0}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Email Queue"
          value={stats?.queueLength || 0}
          color="blue"
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Enable backend authentication to see activity</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon={Flame}
          title="Start Warming"
          description="Begin warming up your email accounts"
          color="orange"
        />
        <QuickActionCard
          icon={Upload}
          title="Import Contacts"
          description="Upload your contact list"
          color="blue"
        />
        <QuickActionCard
          icon={Send}
          title="New Campaign"
          description="Create a new email campaign"
          color="purple"
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
    green: 'from-green-600 to-green-700',
    blue: 'from-blue-600 to-blue-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, color }) {
  const colors = {
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
    blue: 'from-blue-600 to-blue-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// Warming Component
function Warming({ token }) {
  const [accounts, setAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAccounts = async () => {
    const data = await safeFetch(`${API_BASE_URL}/api/warming/accounts`, token);
    setAccounts(data.accounts || []);
  };

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Warming</h1>
          <p className="text-gray-600 mt-1">Gradually warm up your email accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Backend Auth Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Backend Authentication Required</p>
            <p className="text-xs text-yellow-700 mt-1">
              Add backend authentication to enable warming accounts. See AUTH_INTEGRATION_GUIDE.txt
            </p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Warming Accounts ({accounts.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-12 text-center">
            <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Backend authentication required</p>
            <p className="text-sm text-gray-500">Follow the integration guide to enable warming</p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Backend Auth Required</h2>
            <p className="text-gray-600 mb-4">
              Please set up backend authentication first before adding warming accounts.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Contacts Component
function Contacts({ token }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = async () => {
    const data = await safeFetch(`${API_BASE_URL}/api/contacts`, token);
    setContacts(data.contacts || []);
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  const filteredContacts = contacts.filter(contact =>
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your contact list</p>
        </div>
      </div>

      {/* Backend Auth Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Backend Authentication Required</p>
            <p className="text-xs text-yellow-700 mt-1">
              Add backend authentication to manage contacts. See AUTH_INTEGRATION_GUIDE.txt
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Contacts (0)</h2>
        </div>
        <div className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Backend authentication required</p>
          <p className="text-sm text-gray-500">Follow the integration guide to manage contacts</p>
        </div>
      </div>
    </div>
  );
}

// Campaigns Component
function Campaigns({ token }) {
  const [campaigns, setCampaigns] = useState([]);

  const fetchCampaigns = async () => {
    const data = await safeFetch(`${API_BASE_URL}/api/campaigns`, token);
    setCampaigns(data.campaigns || []);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your email campaigns</p>
        </div>
      </div>

      {/* Backend Auth Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Backend Authentication Required</p>
            <p className="text-xs text-yellow-700 mt-1">
              Add backend authentication to create campaigns. See AUTH_INTEGRATION_GUIDE.txt
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Backend authentication required</p>
        <p className="text-sm text-gray-500">Follow the integration guide to create campaigns</p>
      </div>
    </div>
  );
}

// Settings Component
function SettingsPage({ token }) {
  const [settings, setSettings] = useState({
    defaultSenderName: '',
    emailSignature: '',
    timezone: 'UTC',
    emailNotifications: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your system preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Sender Name
          </label>
          <input
            type="text"
            value={settings.defaultSenderName}
            onChange={(e) => setSettings({...settings, defaultSenderName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Signature
          </label>
          <textarea
            value={settings.emailSignature}
            onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Best regards,\nYour Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">API Endpoint</h3>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700">{API_BASE_URL}</code>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            Settings are stored locally. Backend authentication required for server-side storage.
          </p>
        </div>
      </div>
    </div>
  );
}
