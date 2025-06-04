import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCheck, Copy, RefreshCw, User, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Payroll, Profile, BankAccount } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { PayrollDetailsDialog } from "./PayrollDetailsDialog";

interface SalarySheetManagerProps {
  payrolls: Payroll[];
  profiles: Profile[];
  onRefresh: () => void;
}

export const SalarySheetManager = ({ payrolls, profiles, onRefresh }: SalarySheetManagerProps) => {
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [isBulkApprove, setIsBulkApprove] = useState(false);
  const [isBulkPay, setIsBulkPay] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>(payrolls);
  const { toast } = useToast();

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [payrolls, filter]);

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .is('profile_id', null)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setBankAccounts(data as BankAccount[]);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const applyFilter = () => {
    if (!filter) {
      setFilteredPayrolls(payrolls);
      return;
    }

    const lowerCaseFilter = filter.toLowerCase();
    const filtered = payrolls.filter(payroll => {
      const profile = profiles.find(p => p.id === payroll.profile_id);
      if (!profile) return false;

      return (
        profile.full_name.toLowerCase().includes(lowerCaseFilter) ||
        profile.email.toLowerCase().includes(lowerCaseFilter) ||
        payroll.status.toLowerCase().includes(lowerCaseFilter)
      );
    });

    setFilteredPayrolls(filtered);
  };

  const handlePayrollSelect = (payrollId: string) => {
    setSelectedPayrolls(prev => {
      if (prev.includes(payrollId)) {
        return prev.filter(id => id !== payrollId);
      } else {
        return [...prev, payrollId];
      }
    });
  };

  const handleBulkAction = async (action: 'approve' | 'pay') => {
    if (selectedPayrolls.length === 0) {
      toast({
        title: "No Payrolls Selected",
        description: "Please select payrolls to perform this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const updates = selectedPayrolls.map(id => ({
        id: id,
        status: action === 'approve' ? 'approved' : 'paid'
      }));

      const { error } = await supabase
        .from('payroll')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully ${action}d ${selectedPayrolls.length} payrolls.`
      });

      setSelectedPayrolls([]);
      onRefresh();
    } catch (error: any) {
      console.error(`Error during bulk ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} payrolls.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully!`
    });
  };

  const totalPendingAmount = payrolls
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.net_pay, 0);

  const totalApprovedAmount = payrolls
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.net_pay, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-7 w-7 text-gray-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Salary Sheets</h2>
            <p className="text-gray-600">Manage and track employee payrolls</p>
          </div>
        </div>
        <Input
          type="search"
          placeholder="Filter by name, email, or status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payrolls</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{payrolls.filter(p => p.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Require approval</p>
            <p className="text-sm text-orange-500 font-medium">
              ${totalPendingAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Payrolls</CardTitle>
            <CheckCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{payrolls.filter(p => p.status === 'approved').length}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
            <p className="text-sm text-green-500 font-medium">
              ${totalApprovedAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payrolls</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{payrolls.length}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Profiles</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Payrolls</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map(payroll => {
                  const profile = profiles.find(p => p.id === payroll.profile_id);
                  const bankAccount = bankAccounts.find(ba => ba.id === payroll.bank_account_id);

                  return (
                    <tr key={payroll.id} className="border-b">
                      <td className="px-4 py-2">
                        {profile ? (
                          <>
                            <div className="font-medium">{profile.full_name}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                            {bankAccount && (
                              <div className="text-xs text-green-600">
                                Linked to: {bankAccount.bank_name} - {bankAccount.account_number}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-red-500">Profile Not Found</div>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-bold">${payroll.net_pay.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            payroll.status === 'pending' ? 'bg-orange-100 text-orange-800'
                            : payroll.status === 'approved' ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedPayroll(payroll);
                          setIsDetailsOpen(true);
                        }}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulk-approve"
                checked={isBulkApprove}
                onCheckedChange={(checked) => {
                  setIsBulkApprove(checked || false);
                  setIsBulkPay(false);
                }}
              />
              <Label htmlFor="bulk-approve" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Approve Selected Payrolls
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="bulk-pay"
                checked={isBulkPay}
                onCheckedChange={(checked) => {
                  setIsBulkPay(checked || false);
                  setIsBulkApprove(false);
                }}
              />
              <Label htmlFor="bulk-pay" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Mark Selected Payrolls as Paid
              </Label>
            </div>
            <Button
              onClick={() => {
                if (isBulkApprove) handleBulkAction('approve');
                if (isBulkPay) handleBulkAction('pay');
              }}
              disabled={!isBulkApprove && !isBulkPay || loading}
              className="mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Apply Bulk Action"
              )}
            </Button>
          </div>

          <Separator />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">
                    <Label htmlFor="payroll-select-all">Select</Label>
                  </th>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map(payroll => {
                  const profile = profiles.find(p => p.id === payroll.profile_id);

                  return (
                    <tr key={payroll.id} className="border-b">
                      <td className="px-4 py-2">
                        <Checkbox
                          id={`payroll-select-${payroll.id}`}
                          checked={selectedPayrolls.includes(payroll.id)}
                          onCheckedChange={() => handlePayrollSelect(payroll.id)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        {profile ? (
                          <>
                            <div className="font-medium">{profile.full_name}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                          </>
                        ) : (
                          <div className="text-red-500">Profile Not Found</div>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-bold">${payroll.net_pay.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            payroll.status === 'pending' ? 'bg-orange-100 text-orange-800'
                            : payroll.status === 'approved' ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {payroll.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payroll Details Dialog */}
      {selectedPayroll && (
        <PayrollDetailsDialog
          payroll={selectedPayroll}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          profile={profiles.find(p => p.id === selectedPayroll.profile_id)}
          bankAccount={bankAccounts.find(ba => ba.id === selectedPayroll.bank_account_id)}
        />
      )}

      {/* Copy to Clipboard Dialog */}
      <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Copy Payroll Details</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profile-id" className="text-right">
                  Profile ID
                </Label>
                <Input
                  type="text"
                  id="profile-id"
                  defaultValue={selectedPayroll.profile_id}
                  className="col-span-3"
                  readOnly
                />
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(selectedPayroll.profile_id, "Profile ID")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank-account-id" className="text-right">
                  Bank Account ID
                </Label>
                <Input
                  type="text"
                  id="bank-account-id"
                  defaultValue={selectedPayroll.bank_account_id || 'N/A'}
                  className="col-span-3"
                  readOnly
                />
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(selectedPayroll.bank_account_id || 'N/A', "Bank Account ID")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="net-pay" className="text-right">
                  Net Pay
                </Label>
                <Input
                  type="text"
                  id="net-pay"
                  defaultValue={selectedPayroll.net_pay.toFixed(2)}
                  className="col-span-3"
                  readOnly
                />
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(selectedPayroll.net_pay.toFixed(2), "Net Pay")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
