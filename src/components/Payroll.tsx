
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Payroll as PayrollType, Employee, WorkingHour } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

export const Payroll = () => {
  const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [payPeriod, setPayPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          employees (id, name, email)
        `)
        .order('pay_period_end', { ascending: false });

      if (error) throw error;
      setPayrolls((data || []) as PayrollType[]);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payrolls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const generatePayroll = async () => {
    setIsGenerating(true);
    try {
      // Get working hours for the pay period
      const { data: workingHours, error: hoursError } = await supabase
        .from('working_hours')
        .select('*, employees!inner(*)')
        .gte('date', payPeriod.startDate)
        .lte('date', payPeriod.endDate)
        .eq('status', 'approved');

      if (hoursError) throw hoursError;

      // Group hours by employee
      const employeeHours: { [key: string]: { employee: Employee; totalHours: number } } = {};
      
      workingHours?.forEach((wh: WorkingHour & { employees: Employee }) => {
        if (!employeeHours[wh.employee_id]) {
          employeeHours[wh.employee_id] = {
            employee: wh.employees,
            totalHours: 0
          };
        }
        employeeHours[wh.employee_id].totalHours += wh.total_hours;
      });

      // Create payroll records
      const payrollRecords = Object.values(employeeHours).map(({ employee, totalHours }) => {
        const grossPay = totalHours * employee.hourly_rate;
        const deductions = grossPay * 0.2; // 20% deductions (taxes, etc.)
        const netPay = grossPay - deductions;

        return {
          employee_id: employee.id,
          pay_period_start: payPeriod.startDate,
          pay_period_end: payPeriod.endDate,
          total_hours: totalHours,
          hourly_rate: employee.hourly_rate,
          gross_pay: grossPay,
          deductions: deductions,
          net_pay: netPay,
          status: 'pending'
        };
      });

      if (payrollRecords.length === 0) {
        toast({
          title: "No Data",
          description: "No approved working hours found for the selected period",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('payroll')
        .insert(payrollRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Generated payroll for ${payrollRecords.length} employees`
      });

      setIsDialogOpen(false);
      fetchPayrolls();
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        title: "Error",
        description: "Failed to generate payroll",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePayrollStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payroll status updated to ${status}`
      });

      fetchPayrolls();
    } catch (error) {
      console.error('Error updating payroll status:', error);
      toast({
        title: "Error",
        description: "Failed to update payroll status",
        variant: "destructive"
      });
    }
  };

  const totalGrossPay = payrolls.reduce((sum, p) => sum + p.gross_pay, 0);
  const totalNetPay = payrolls.reduce((sum, p) => sum + p.net_pay, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);
  const pendingPayrolls = payrolls.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Generate Payroll
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Pay Period Start</Label>
              <Input
                id="startDate"
                type="date"
                value={payPeriod.startDate}
                onChange={(e) => setPayPeriod({ ...payPeriod, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Pay Period End</Label>
              <Input
                id="endDate"
                type="date"
                value={payPeriod.endDate}
                onChange={(e) => setPayPeriod({ ...payPeriod, endDate: e.target.value })}
              />
            </div>
            <Button onClick={generatePayroll} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate Payroll"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gross Pay</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalGrossPay.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Before deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Net Pay</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalNetPay.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deductions</CardTitle>
            <DollarSign className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalDeductions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Taxes & benefits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payrolls</CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingPayrolls}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Pay Period</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Gross Pay</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Deductions</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Net Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {payroll.employees?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {payroll.pay_period_start} to {payroll.pay_period_end}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {payroll.total_hours.toFixed(1)}h
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      ${payroll.hourly_rate.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ${payroll.gross_pay.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      ${payroll.deductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-600">
                      ${payroll.net_pay.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={payroll.status === "paid" ? "default" : 
                                payroll.status === "approved" ? "secondary" : "outline"}
                        className={
                          payroll.status === "paid" ? "bg-green-100 text-green-800" :
                          payroll.status === "approved" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payroll.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {payroll.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updatePayrollStatus(payroll.id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}
                        {payroll.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayrollStatus(payroll.id, 'paid')}
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
