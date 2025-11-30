"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Calendar, 
  Car, 
  LogOut, 
  X,
  Home,
  Settings,
  Users,
  TrendingUp,
  Bell,
  Video,
  Image as ImageIcon
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3, description: "Overview & Analytics" },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar, description: "Manage Reservations" },
  { href: "/admin/cars", label: "Cars Management", icon: Car, description: "Fleet Management" },
  { href: "/admin/updates", label: "Updates", icon: Bell, description: "Site Announcements" },
  { href: "/admin/homepage", label: "Homepage", icon: Video, description: "Hero Video & Banners" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Full Height 100vh */}
      <div className={`
        fixed top-0 left-0 z-50 w-72 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-screen flex-col min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-start p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="flex w-10 h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-xl font-bold text-white shadow-lg">
                Z
              </div>
              <div className="leading-tight">
                <span className="block text-xl font-bold text-white">Zion Admin</span>
                <span className="text-sm text-white/80">Management Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section with user info and logout */}
          <div className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {/* User info */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex w-10 h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold text-white shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            
            {/* Logout button at the very end */}
            <div className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden ml-0 lg:ml-72">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {navigationItems.find(item => item.href === pathname)?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {navigationItems.find(item => item.href === pathname)?.description || 'Manage your car rental operations'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Customer Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}