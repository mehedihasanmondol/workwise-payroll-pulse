
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Clock } from "lucide-react";

interface WorkingHour {
  id: number;
  employee: string;
  client: string;
  project: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: "pending" | "approved" | "rejected";
}

export const WorkingHours = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  
  const [workingHours] = useState<WorkingHour[]>([
    {
      id: 1,
      employee: "John Doe",
      client: "ABC Corporation",
      project: "Website Redesign",
      date: "2024-05-29",
      startTime: "09:00",
      endTime: "17:00",
      totalHours: 8,
      status: "approved"
    },
    {
      id: 2,
      employee: "Jane Smith",
      client: "XYZ Industries",
      project: "Mobile App Development",
      date: "2024-05-29",
      startTime: "10:00",
      endTime: "18:00",
      totalHours: 8,
      status: "pending"
    },
    {
      id: 3,
      employee: "Mike Johnson",
      client: "TechStart Inc",
      project: "Database Migration",
      date: "2024-05-28",
      startTime: "08:30",
      endTime: "16:30",
      totalHours: 8,
      status: "approved"
    }
  ]);

  const filteredHours = workingHours.filter(hour => {
    const matchesSearch = hour.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hour.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hour.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = filterEmployee === "all" || hour.employee === filterEmployee;
    const matchesClient = filterClient === "all" || hour.client === filterClient;
    
    return matchesSearch && matchesEmployee && matchesClient;
  });

  const totalHours = filteredHours.reduce((sum, hour) => sum + hour.totalHours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Working Hours</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Hours
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hours Logged</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">164h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {workingHours.filter(h => h.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Hours Log</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search hours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="ABC Corporation">ABC Corporation</SelectItem>
                  <SelectItem value="XYZ Industries">XYZ Industries</SelectItem>
                  <SelectItem value="TechStart Inc">TechStart Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Start</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">End</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHours.map((hour) => (
                  <tr key={hour.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{hour.employee}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.client}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.project}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.date}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.startTime}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.endTime}</td>
                    <td className="py-3 px-4 text-gray-600">{hour.totalHours}h</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        hour.status === "approved" ? "bg-green-100 text-green-800" :
                        hour.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {hour.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
