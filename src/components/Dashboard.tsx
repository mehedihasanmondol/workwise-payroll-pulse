
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FolderOpen, Clock, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeClients: 0,
    currentProjects: 0,
    hoursThisWeek: 0,
    bankBalance: 0,
    scheduledToday: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch employees count
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('status', 'active');

      // Fetch active clients count
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'active');

      // Fetch current projects count
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

      // Fetch working hours this week
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      const { data: workingHours } = await supabase
        .from('working_hours')
        .select('total_hours')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      // Fetch bank balance
      const { data: transactions } = await supabase
        .from('bank_transactions')
        .select('amount, type');

      const totalDeposits = transactions?.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalWithdrawals = transactions?.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0) || 0;
      const bankBalance = totalDeposits - totalWithdrawals;

      // Calculate hours this week
      const hoursThisWeek = workingHours?.reduce((sum, h) => sum + h.total_hours, 0) || 0;

      // Fetch today's schedule (simplified - you could expand this based on your scheduling system)
      const todayString = new Date().toISOString().split('T')[0];
      const { data: todayHours } = await supabase
        .from('working_hours')
        .select('id')
        .eq('date', todayString);

      setStats({
        totalEmployees: employees?.length || 0,
        activeClients: clients?.length || 0,
        currentProjects: projects?.length || 0,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        bankBalance,
        scheduledToday: todayHours?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const dashboardStats = [
    { title: "Total Employees", value: stats.totalEmployees.toString(), icon: Users, color: "text-blue-600" },
    { title: "Active Clients", value: stats.activeClients.toString(), icon: Building2, color: "text-green-600" },
    { title: "Current Projects", value: stats.currentProjects.toString(), icon: FolderOpen, color: "text-purple-600" },
    { title: "Hours This Week", value: `${stats.hoursThisWeek}h`, icon: Clock, color: "text-orange-600" },
    { title: "Bank Balance", value: `$${stats.bankBalance.toLocaleString()}`, icon: DollarSign, color: stats.bankBalance >= 0 ? "text-emerald-600" : "text-red-600" },
    { title: "Scheduled Today", value: stats.scheduledToday.toString(), icon: Calendar, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back! Here's your business overview.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">New working hours logged</span>
                <span className="text-xs text-gray-500">Recently</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Database connected successfully</span>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">System ready for use</span>
                <span className="text-xs text-gray-500">Now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Log Working Hours</p>
                  <p className="text-sm text-gray-600">Record employee work time</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Manage Projects</p>
                  <p className="text-sm text-gray-600">Create and update projects</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
