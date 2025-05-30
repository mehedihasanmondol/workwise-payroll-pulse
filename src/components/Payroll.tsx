
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Users, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, WorkingHour } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface PayrollEntry {
  employee_id: string;
  employee_name: string;
  hourly_rate: number;
  total_hours: number;
  gross_pay: number;
  status: 'pending' | 'processed' | 'paid';
  period_start: string;
  period_end: string;
}

export const Payroll = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("current-week");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchWorkingHours();
  }, [selectedPeriod]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setEmployees((data || []) as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const dateRange = getDateRange();
      
      const { data, error } = await supabase
        .from('working_hours')
        .select(`
          *,
          employees (id, name, hourly_rate)
        `)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .eq('status', 'approved');

      if (error) throw error;
      setWorkingHours((data || []) as WorkingHour[]);
      calculatePayroll(data || [], employees);
    } catch (error) {
      console.error('Error fetching working hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (selectedPeriod) {
      case "current-week":
        const dayOfWeek = now.getDay();
        start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        break;
      case "last-week":
        const lastWeekStart = new Date(now.getTime() - (now.getDay() + 7) * 24 * 60 * 60 * 1000);
        start = lastWeekStart;
        end = new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        break;
      case "current-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const calculatePayroll = (hours: WorkingHour[], employeeList: Employee[]) => {
    const payrollMap = new Map<string, PayrollEntry>();
    const dateRange = getDateRange();

    employeeList.forEach(employee => {
      const employeeHours = hours.filter(h => h.employee_id === employee.id);
      const totalHours = employeeHours.reduce((sum, h) => sum + h.total_hours, 0);
      const grossPay = totalHours * employee.hourly_rate;

      if (totalHours > 0) {
        payrollMap.set(employee.id, {
          employee_id: employee.id,
          employee_name: employee.name,
          hourly_rate: employee.hourly_rate,
          total_hours: totalHours,
          gross_pay: grossPay,
          status: 'pending',
          period_start: dateRange.start,
          period_end: dateRange.end
        });
      }
    });

    setPayrollEntries(Array.from(payrollMap.values()));
  };

  const processPayroll = async (employeeId: string) => {
    setPayrollEntries(prev => prev.map(entry => 
      entry.employee_id === employeeId 
        ? { ...entry, status: 'processed' as const }
        : entry
    ));
    
    toast({ 
      title: "Payroll Processed", 
      description: "Employee payroll has been processed and is ready for payment" 
    });
  };

  const markAsPaid = async (employeeId: string) => {
    setPayrollEntries(prev => prev.map(entry => 
      entry.employee_id === employeeId 
        ? { ...entry, status: 'paid' as const }
        : entry
    ));
    
    toast({ 
      title: "Payment Confirmed", 
      description: "Employee payment has been marked as paid" 
    });
  };

  const getTotalPayroll = () => {
    return payrollEntries.reduce((sum, entry) => sum + entry.gross_pay, 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Processed</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">Current Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="current-month">Current Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payroll</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${getTotalPayroll().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Employees</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{payrollEntries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Calendar className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payrollEntries.filter(e => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payrollEntries.filter(e => e.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hourly Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Gross Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollEntries.map((entry) => (
                  <tr key={entry.employee_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{entry.employee_name}</td>
                    <td className="py-3 px-4 text-gray-600">${entry.hourly_rate}/hr</td>
                    <td className="py-3 px-4 text-gray-600">{entry.total_hours}h</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${entry.gross_pay.toLocaleString()}</td>
                    <td className="py-3 px-4">{getStatusBadge(entry.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {entry.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => processPayroll(entry.employee_id)}
                          >
                            Process
                          </Button>
                        )}
                        {entry.status === 'processed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsPaid(entry.employee_id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
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
