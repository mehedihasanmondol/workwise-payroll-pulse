
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Clock, DollarSign, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, WorkingHour, Payroll } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface EmployeeDashboardProps {
  employee: Employee;
  onLogout: () => void;
}

export const EmployeeDashboard = ({ employee, onLogout }: EmployeeDashboardProps) => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeData();
  }, [employee.id]);

  const fetchEmployeeData = async () => {
    try {
      // Fetch working hours for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      const { data: hours, error: hoursError } = await supabase
        .from('working_hours')
        .select(`
          *,
          clients (company),
          projects (name)
        `)
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (hoursError) throw hoursError;
      setWorkingHours((hours || []) as WorkingHour[]);

      // Fetch payroll records
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (payrollError) throw payrollError;
      setPayrolls((payrollData || []) as Payroll[]);

    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'paid': return 'default';
      default: return 'secondary';
    }
  };

  const totalHoursThisMonth = workingHours.reduce((sum, wh) => sum + (wh.total_hours || 0), 0);
  const pendingHours = workingHours.filter(wh => wh.status === 'pending').reduce((sum, wh) => sum + (wh.total_hours || 0), 0);
  const approvedHours = workingHours.filter(wh => wh.status === 'approved').reduce((sum, wh) => sum + (wh.total_hours || 0), 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {employee.name}</h1>
              <p className="text-gray-600">{employee.role} • ${employee.hourly_rate}/hour</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours (This Month)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHoursThisMonth}h</div>
              <p className="text-xs text-muted-foreground">
                {workingHours.length} entries recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingHours}h</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedHours}h</div>
              <p className="text-xs text-muted-foreground">
                Ready for payroll
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(approvedHours * employee.hourly_rate).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From approved hours
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Working Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workingHours.slice(0, 10).map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{new Date(wh.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">{wh.clients?.company} - {wh.projects?.name}</div>
                      <div className="text-sm text-gray-600">{wh.start_time} - {wh.end_time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{wh.total_hours}h</div>
                      <Badge variant={getStatusBadgeVariant(wh.status)}>
                        {wh.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {workingHours.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No working hours recorded this month</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payroll */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrolls.map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">{payroll.total_hours}h @ ${payroll.hourly_rate}/hr</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${payroll.net_pay}</div>
                      <Badge variant={getStatusBadgeVariant(payroll.status)}>
                        {payroll.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {payrolls.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No payroll records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
