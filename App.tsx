import React, { useEffect, useState } from 'react';
import { User, ThemeName } from './types';
import { getCurrentUser, logout } from './services/db';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Records } from './pages/Records';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { LogPanel } from './components/LogPanel';
import { Menu, Bell, Search, User as UserIcon, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState<ThemeName>('default');
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Initial Load
  useEffect(() => {
    // Auth Check
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Show intro popup only if it's the first time in this session (simplified for demo)
      if (!sessionStorage.getItem('seen_intro')) {
        setTimeout(() => setShowPopup(true), 1000);
      }
    }

    // Load Theme Preference
    const savedTheme = localStorage.getItem('iffidb_theme') as ThemeName;
    if (savedTheme) setTheme(savedTheme);

    // Load Mode Preference
    const savedMode = localStorage.getItem('iffidb_mode');
    if (savedMode === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Listen for dark mode system changes if no preference is set
    // (Optional enhancement, sticking to explicit user choice for now)
  }, []);

  // Theme Handler
  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem('iffidb_theme', newTheme);
  };

  // Dark Mode Handler
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('iffidb_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('iffidb_mode', 'light');
    }
  };

  const handleLoginSuccess = () => {
    const u = getCurrentUser();
    setUser(u);
    setShowPopup(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentPage('dashboard');
    sessionStorage.removeItem('seen_intro');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('seen_intro', 'true');
  };

  if (!user) {
    return (
      <div className={`theme-${theme} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'records': return <Records />;
      case 'settings': 
        return (
          <Settings 
            currentTheme={theme} 
            setTheme={handleThemeChange} 
            isDark={isDark} 
            toggleDarkMode={toggleDarkMode} 
          />
        );
      case 'about': return <About />;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'records': return 'Records Management';
      case 'settings': return 'Settings';
      case 'about': return 'About Developer';
      default: return 'Dashboard';
    }
  };

  return (
    <div className={`theme-${theme} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex`}>
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Search (Desktop) */}
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
              />
            </div>

            {/* Icons */}
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>

            {/* Profile Dropdown (Simplified) */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-600">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Execution Log Panel */}
      <LogPanel />

      {/* Intro Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all scale-100">
            <button 
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <UserIcon size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Project By Iftikhar Ali
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This project is created by Iftikhar Ali for a university assignment. 
                It features a complete admin panel with simulated backend logic, dynamic theming, and real-time execution logs.
              </p>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleClosePopup}
                  className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all"
                >
                  Explore Project
                </button>
                <button 
                  onClick={() => {
                    handleClosePopup();
                    setCurrentPage('about');
                  }}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Contact Dev
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;