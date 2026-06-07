import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';
import { Users, LayoutDashboard, Settings, Activity, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { session, userRole, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'settings'
  const { toasts, showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users from profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      const { count: txCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      setUsers(profiles || []);
      
      const adminCount = profiles?.filter(p => p.role === 'admin').length || 0;
      
      setStats({
        totalUsers: profiles?.length || 0,
        totalTransactions: txCount || 0,
        totalAdmins: adminCount
      });
    } catch (error) {
      showToast('Gagal memuat data admin: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Yakin ingin mengubah role user ini menjadi ${newRole.toUpperCase()}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      showToast('Role berhasil diubah', 'success');
      fetchAdminData();
    } catch (error) {
      showToast('Gagal mengubah role: ' + error.message, 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="animate-spin text-primary-600">
          <Activity size={32} />
        </div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center w-full px-3 py-2.5 rounded-xl font-medium transition-all ${
        activeTab === id 
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon size={20} className="mr-3" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center mr-3 shadow-md">
            <ShieldAlert size={18} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
          <NavItem id="users" icon={Users} label="Users" />
          <NavItem id="settings" icon={Settings} label="System Settings" />
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout (Admin)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center">
            <ShieldAlert className="text-red-600 mr-2" size={24} />
            <span className="font-bold">Admin Panel</span>
          </div>
          <button onClick={handleSignOut} className="p-2 text-red-600"><LogOut size={20} /></button>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
          
          {/* CONTENT SWITCHER */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-2xl font-bold">Admin Dashboard Overview</h2>
                <p className="text-gray-500 dark:text-gray-400">Selamat datang kembali, Admin.</p>
              </header>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-[100px] -mr-4 -mt-4"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Registered Users</h3>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-[100px] -mr-4 -mt-4"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Transactions</h3>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Activity size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">{stats.totalTransactions}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-[100px] -mr-4 -mt-4"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">System Admins</h3>
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                      <ShieldAlert size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">{stats.totalAdmins}</p>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'users') && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="mr-2 text-primary-500" size={20} />
                  User Management
                </h2>
                <button onClick={fetchAdminData} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Refresh Data</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Username</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Joined At</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">{user.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            ${user.role === 'admin' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {user.role === 'admin' && <ShieldAlert size={12} className="mr-1" />}
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric'})}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={user.id === session?.user?.id}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                              ${user.id === session?.user?.id 
                                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700' 
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            {user.role === 'admin' ? 'Downgrade to User' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data pengguna ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
              <div className="text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Settings size={32} />
                </div>
                <h2 className="text-xl font-bold">System Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Halaman ini masih dalam tahap pengembangan. Nantinya di sini Admin bisa mengatur kebijakan aplikasi secara global.
                </p>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
};
export default AdminDashboard;
