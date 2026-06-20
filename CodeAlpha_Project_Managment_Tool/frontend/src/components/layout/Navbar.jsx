import { useState, useRef, useEffect } from 'react';
import { useNavigate }                  from 'react-router-dom';
import { useAuth }                      from '../../context/AuthContext';
import {useSocket }                     from '../../context/SocketContext'
import { Search, Bell, Sun, Settings, LogOut, ChevronDown } from 'lucide-react';
import toast                            from 'react-hot-toast';
import API                              from '../../api/axios';

const Navbar = () => {
  const navigate        = useNavigate();
  const { user, logout } = useAuth();

  const [search,          setSearch]          = useState('');
  const [showUserMenu,    setShowUserMenu]     = useState(false);
  const [unreadCount,     setUnreadCount]      = useState(0);

  const userMenuRef = useRef(null);

  // ── Get initials ────────────────────────────────────
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ── Fetch unread notification count ─────────────────
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get('/notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // silent fail
      }
    };
    fetchUnread();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Close menu on outside click ──────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Logout ───────────────────────────────────────────
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // ── Search submit ────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/projects?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="h-14 bg-dark-sidebar border-b border-dark-border
                       flex items-center justify-between px-4 flex-shrink-0">

      {/* ── Search Bar ─────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 
                             w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tasks, people..."
            className="w-full bg-dark-input border border-dark-border 
                       text-text-primary placeholder-text-muted
                       rounded-lg pl-9 pr-4 py-1.5 text-sm
                       focus:outline-none focus:border-primary 
                       focus:ring-1 focus:ring-primary
                       transition-all duration-200"
          />
        </div>
      </form>

      {/* ── Right Side Actions ─────────────────────────── */}
      <div className="flex items-center gap-2 ml-4">

        {/* Theme toggle (visual only for now) */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-text-muted hover:text-text-primary 
                     hover:bg-dark-hover transition-all duration-200"
          title="Toggle theme"
        >
          {/* <Sun className="w-4 h-4" /> */}
        </button>

        {/* Notifications bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-8 h-8 flex items-center justify-center 
                     rounded-lg text-text-muted hover:text-text-primary 
                     hover:bg-dark-hover transition-all duration-200"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 
                             bg-red-500 text-white text-xs rounded-full 
                             flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg
                       hover:bg-dark-hover transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center 
                            justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className={`w-3 h-3 text-text-muted transition-transform 
                                     duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52
                            bg-dark-card border border-dark-border 
                            rounded-xl shadow-modal z-50 overflow-hidden">

              {/* User info */}
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                             text-sm text-text-secondary 
                             hover:text-text-primary hover:bg-dark-hover
                             transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                             text-sm text-red-400 hover:text-red-300 
                             hover:bg-dark-hover transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;