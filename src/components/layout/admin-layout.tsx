"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Car,
  LogOut,
  X,
  Home,
  Bell,
  Video,
  Image as ImageIcon,
  Menu,
  Users,
  Briefcase
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/env";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3, description: "Overview & Analytics" },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar, description: "Manage Reservations" },
  { href: "/admin/admin-bookings", label: "Admin Bookings", icon: Briefcase, description: "Offline Walk-in Bookings" },
  { href: "/admin/customers", label: "Customers", icon: Users, description: "Customer Database" },
  { href: "/admin/cars", label: "Cars Management", icon: Car, description: "Fleet Management" },
  { href: "/admin/updates", label: "Updates", icon: Bell, description: "Site Announcements" },
  { href: "/admin/homepage", label: "Homepage", icon: Video, description: "Hero Video & Banners" },
  { href: "/admin/carspage", label: "Cars Page", icon: ImageIcon, description: "Cars Page Banner" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const logoUrl = `${getApiBaseUrl()}/uploads/logo.png`;

  // Detect screen size - 1024px is the breakpoint
  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // On desktop, sidebar should always be open
      if (desktop) {
        setIsSidebarOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isDesktop]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (!isDesktop && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen, isDesktop]);

  const toggleSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const closeSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className="flex flex-col border-r border-slate-200 dark:border-slate-700 shadow-2xl"
        style={{
          position: isDesktop ? 'relative' : 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '288px', // 72 * 4 = 288px (w-72)
          transform: isDesktop ? 'translateX(0)' : isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          backgroundColor: 'black',
          zIndex: 50,
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center space-x-3"
            onClick={closeSidebar}
          >
            <img
              src={logoUrl}
              alt="Zion Admin"
              className="w-10 h-10 rounded-full object-contain bg-white/20 backdrop-blur-sm shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="leading-tight">
              <span className="block text-xl font-bold text-white">Zion Admin</span>
              <span className="text-sm text-white/80">Management Portal</span>
            </div>
          </Link>

          {/* Mobile Close Button - Only show on mobile */}
          {!isDesktop && (
            <button
              onClick={closeSidebar}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-slate-800">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`
                  flex items-center space-x-3 rounded-xl px-4 py-3
                  text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{item.label}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout - Fixed Bottom */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold text-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 sm:px-6 py-4 shadow-sm z-30 flex-shrink-0">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Mobile Menu Button - Only show on mobile */}
            {!isDesktop && (
              <button
                onClick={toggleSidebar}
                className="flex-shrink-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {navigationItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                {navigationItems.find(item => item.href === pathname)?.description || 'Overview & Analytics'}
              </p>
            </div>
          </div>

          <Link href="/" className="flex-shrink-0">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Customer Site</span>
            </Button>
          </Link>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
