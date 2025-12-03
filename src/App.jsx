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

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setStats(data);
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
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
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
  const [warmingActive, setWarmingActive] = useState(false);
  const [emailsPerDay, setEmailsPerDay] = useState(20);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchWarmingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWarmingActive(data.isActive || false);
    } catch (error) {
      console.error('Error fetching warming status:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchWarmingStatus();
  }, [token]);

  const handleStartWarming = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/campaigns/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailsPerDay })
      });
      if (response.ok) {
        setWarmingActive(true);
        alert('Warming started successfully!');
      }
    } catch (error) {
      alert('Failed to start warming');
    }
  };

  const handleStopWarming = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/campaigns/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWarmingActive(false);
        alert('Warming stopped');
      }
    } catch (error) {
      alert('Failed to stop warming');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Delete this warming account?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      alert('Failed to delete account');
    }
  };

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

      {/* Warming Control Panel */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Warming Control</h2>
            <p className="text-orange-100 mt-1">
              {warmingActive ? 'System is actively warming accounts' : 'Warming is currently inactive'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            warmingActive ? 'bg-white/20 animate-pulse' : 'bg-white/10'
          }`}>
            <Flame className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-orange-100 text-sm mb-1">Active Accounts</p>
            <p className="text-3xl font-bold">{accounts.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-orange-100 text-sm mb-1">Emails Per Day</p>
            <p className="text-3xl font-bold">{emailsPerDay}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-orange-100 mb-2 block">
            Emails Per Day: {emailsPerDay}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={emailsPerDay}
            onChange={(e) => setEmailsPerDay(Number(e.target.value))}
            className="w-full"
            disabled={warmingActive}
          />
        </div>

        <div className="flex space-x-3">
          {!warmingActive ? (
            <button
              onClick={handleStartWarming}
              disabled={accounts.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>Start Warming</span>
            </button>
          ) : (
            <button
              onClick={handleStopWarming}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50"
            >
              <Pause className="w-4 h-4" />
              <span>Stop Warming</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Warming Accounts ({accounts.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {accounts.length === 0 ? (
            <div className="p-12 text-center">
              <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No warming accounts yet</p>
              <p className="text-sm text-gray-500">Add your first account to start warming</p>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{account.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      SMTP: {account.smtpHost}:{account.smtpPort}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAccounts();
          }}
          token={token}
        />
      )}
    </div>
  );
}

// Add Account Modal Component
function AddAccountModal({ onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    smtpHost: '',
    smtpPort: '587',
    imapHost: '',
    imapPort: '993',
    fromName: ''
  });
  const [testing, setTesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/warming/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Account added successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add account');
      }
    } catch (error) {
      alert('Failed to add account');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/smtp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Connection successful!');
      } else {
        alert('❌ Connection failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Warming Account</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={formData.smtpHost}
                onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={formData.smtpPort}
                onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMAP Host
              </label>
              <input
                type="text"
                value={formData.imapHost}
                onChange={(e) => setFormData({...formData, imapHost: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="imap.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMAP Port
              </label>
              <input
                type="number"
                value={formData.imapPort}
                onChange={(e) => setFormData({...formData, imapPort: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contacts Component
function Contacts({ token }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800"
        >
          <Upload className="w-4 h-4" />
          <span>Import CSV</span>
        </button>
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
          <h2 className="text-xl font-bold">
            All Contacts ({filteredContacts.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No contacts found</p>
                    <p className="text-sm text-gray-500">Import a CSV file to get started</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.company || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm text-blue-600 hover:text-blue-700 mr-3">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchContacts();
          }}
          token={token}
        />
      )}
    </div>
  );
}

// Import CSV Modal Component
function ImportCSVModal({ onClose, onSuccess, token }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // Read CSV file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {};
        headers.forEach((header, index) => {
          contact[header] = values[index];
        });
        contacts.push(contact);
      }

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contacts })
      });

      if (response.ok) {
        alert(`Successfully imported ${contacts.length} contacts!`);
        onSuccess();
      } else {
        alert('Failed to import contacts');
      }
    } catch (error) {
      alert('Error importing CSV: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Import Contacts</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              CSV should have columns: firstName, lastName, email, company
            </p>
          </div>

          {file && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                File selected: {file.name}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            >
              {uploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Campaigns Component
function Campaigns({ token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No campaigns yet</p>
            <p className="text-sm text-gray-500">Create your first campaign to get started</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sent</p>
                  <div className="flex items-center space-x-1">
                    <Send className="w-4 h-4 text-blue-600" />
                    <p className="text-lg font-bold text-gray-900">{campaign.sent || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Opened</p>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-green-600" />
                    <p className="text-lg font-bold text-gray-900">{campaign.opened || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Clicked</p>
                  <div className="flex items-center space-x-1">
                    <MousePointer className="w-4 h-4 text-purple-600" />
                    <p className="text-lg font-bold text-gray-900">{campaign.clicked || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Replied</p>
                  <div className="flex items-center space-x-1">
                    <Reply className="w-4 h-4 text-orange-600" />
                    <p className="text-lg font-bold text-gray-900">{campaign.replied || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                  Pause
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
          token={token}
        />
      )}
    </div>
  );
}

// Create Campaign Modal Component
function CreateCampaignModal({ onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    dailyLimit: 50
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Campaign created successfully!');
        onSuccess();
      } else {
        alert('Failed to create campaign');
      }
    } catch (error) {
      alert('Error creating campaign');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Q1 Outreach Campaign"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Quick question about..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Use {{firstName}}, {{company}} for personalization"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {`{{firstName}}`}, {`{{lastName}}`}, {`{{company}}`} for personalization
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Limit: {formData.dailyLimit}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={formData.dailyLimit}
              onChange={(e) => setFormData({...formData, dailyLimit: Number(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 emails/day</span>
              <span>200 emails/day</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800"
            >
              Create Campaign
            </button>
          </div>
        </form>
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

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

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

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Receive email alerts for campaign activities</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">API Endpoint</h3>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="text-sm text-gray-700">{API_BASE_URL}</code>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
