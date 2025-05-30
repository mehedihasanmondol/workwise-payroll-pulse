
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FolderOpen, Clock, DollarSign, Calendar } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    { title: "Total Employees", value: "24", icon: Users, color: "text-blue-600" },
    { title: "Active Clients", value: "8", icon: Building2, color: "text-green-600" },
    { title: "Current Projects", value: "12", icon: FolderOpen, color: "text-purple-600" },
    { title: "Hours This Week", value: "342", icon: Clock, color: "text-orange-600" },
    { title: "Bank Balance", value: "$24,580", icon: DollarSign, color: "text-emerald-600" },
    { title: "Scheduled Today", value: "18", icon: Calendar, color: "text-indigo-600" },
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
        {stats.map((stat) => {
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
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
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
                <span className="text-sm">John Doe clocked in for ABC Corp project</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">New client "TechStart Inc" added</span>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Payroll generated for week ending 05/25</span>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Morning Team - ABC Corp</p>
                  <p className="text-sm text-gray-600">8:00 AM - 4:00 PM</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Today</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Evening Shift - XYZ Project</p>
                  <p className="text-sm text-gray-600">2:00 PM - 10:00 PM</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Tomorrow</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
