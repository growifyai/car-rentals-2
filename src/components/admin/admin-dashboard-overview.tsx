"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Car, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchAdminStats } from "@/lib/admin";

interface AdminStats {
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export function AdminDashboardOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const statsResponse = await fetchAdminStats(token);
        setStats(statsResponse);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Unable to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);



  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From completed rentals
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bookings</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cars</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Car className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalCars || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fleet size
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Rentals</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.activeBookings || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Currently rented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Cars</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.availableCars || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ready for rental
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Reviews</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats?.pendingBookings || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed Rentals</CardTitle>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.completedBookings || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
