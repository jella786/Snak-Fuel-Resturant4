import React, { useState, useEffect } from 'react';
import { Flame, ShoppingBag, User as UserIcon, Shield, Bike, Headphones, Menu as MenuIcon, X, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenAuth }) => {
  const { user, logout, quickSwitch } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Menu', view: 'menu' },
    { label: 'Offers', view: 'offers' },
    { label: 'Track Order', view: 'track' },
    { label: 'Support', view: 'support' },
    { label: 'About', view: 'about' },
  ];

  return (
    <>
      {/* Role Indicator Banner for Demo & Reviewers */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400 py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Snack Fuel Kitchen: Active & Taking Orders</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-500 hidden sm:inline">Active Role:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-amber-400 uppercase tracking-wider">{user ? user.role : 'Guest'}</span>
            <span className="text-neutral-600">·</span>
            <button
              onClick={() => quickSwitch(user?.role === 'admin' ? 'customer' : 'admin')}
              className="hover:text-amber-300 underline font-medium transition-colors cursor-pointer"
            >
              {user?.role === 'admin' ? 'Switch to Customer View' : 'Switch to Admin Portal'}
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark with icon */}
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-neutral-950" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
              SNACK <span className="text-amber-400">FUEL</span>
            </span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold tracking-wide">
            {navLinks.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-amber-400 font-bold' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 py-1 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  currentView === 'admin' ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </button>
            )}
            {user?.role === 'rider' && (
              <button
                onClick={() => setCurrentView('rider')}
                className={`flex items-center gap-1.5 py-1 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  currentView === 'rider' ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-400" />
                <span>Rider Portal</span>
              </button>
            )}
            {user?.role === 'support' && (
              <button
                onClick={() => setCurrentView('support-agent')}
                className={`flex items-center gap-1.5 py-1 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  currentView === 'support-agent' ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'
                }`}
              >
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Agent Desk</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions (Notifications, Cart, Account/Login) */}
          <div className="flex items-center gap-3">
            {/* Notifications icon */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 px-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                      <button
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          setUnreadCount(0);
                        }}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-neutral-800/60 mt-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-neutral-500 py-4 text-center">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              api.markNotificationRead(n.id);
                              setNotifications((prev) =>
                                prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                              );
                              setUnreadCount((c) => Math.max(0, c - 1));
                              if (n.link) {
                                if (n.link.startsWith('/track/')) {
                                  setCurrentView('track');
                                } else if (n.link.startsWith('/admin')) {
                                  setCurrentView('admin');
                                } else if (n.link.startsWith('/rider')) {
                                  setCurrentView('rider');
                                }
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`p-2.5 text-xs rounded-lg hover:bg-neutral-800/80 cursor-pointer transition-colors ${
                              !n.read ? 'bg-amber-400/5' : ''
                            }`}
                          >
                            <p className="font-semibold text-neutral-200">{n.title}</p>
                            <p className="text-neutral-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 py-2 px-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl transition-all cursor-pointer group"
              aria-label="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-400 text-neutral-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
            </button>

            {/* User Account / Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 rounded-xl text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                    }}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/40"
                  />
                  <span className="max-w-[90px] truncate hidden md:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="p-2 border-b border-neutral-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Role: {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>My Profile & Orders</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {user.role === 'rider' && (
                      <button
                        onClick={() => {
                          setCurrentView('rider');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Rider Portal</span>
                      </button>
                    )}

                    {user.role === 'support' && (
                      <button
                        onClick={() => {
                          setCurrentView('support-agent');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Support Agent Desk</span>
                      </button>
                    )}

                    <div className="border-t border-neutral-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-2 px-4 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 whitespace-nowrap cursor-pointer"
              >
                Sign In / Register
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
            {navLinks.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === item.view ? 'bg-amber-400/10 text-amber-400' : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold text-amber-400 hover:bg-neutral-900 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}

            {user?.role === 'rider' && (
              <button
                onClick={() => {
                  setCurrentView('rider');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold text-amber-400 hover:bg-neutral-900 flex items-center gap-2"
              >
                <Bike className="w-4 h-4" />
                <span>Rider Portal</span>
              </button>
            )}

            {user?.role === 'support' && (
              <button
                onClick={() => {
                  setCurrentView('support-agent');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold text-amber-400 hover:bg-neutral-900 flex items-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>Support Agent Desk</span>
              </button>
            )}

            <div className="pt-3 border-t border-neutral-800">
              <p className="text-[11px] text-neutral-500 mb-2">Switch Role (Fast Demo Testing):</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    quickSwitch('customer');
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 text-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                >
                  Customer
                </button>
                <button
                  onClick={() => {
                    quickSwitch('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 text-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                >
                  Admin
                </button>
                <button
                  onClick={() => {
                    quickSwitch('rider');
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 text-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                >
                  Rider
                </button>
                <button
                  onClick={() => {
                    quickSwitch('support');
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 text-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                >
                  Support
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
