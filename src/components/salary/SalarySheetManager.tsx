
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, DollarSign, Users, Calendar, FileText } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const filteredPayrolls = payrolls.filter(payroll => {
    const profile = profiles.find(p => p.id === payroll.profile_id);
    if (!profile) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower) ||
      payroll.status.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = async (payroll: Payroll) => {
    const profile = profiles.find(p => p.id === payroll.profile_id);
    if (!profile) {
      toast({
        title: "Error",
        description: "Profile not found",
        variant: "destructive"
      });
      return;
    }

    // Fetch bank account details if available
    let bankAccount = null;
    if (payroll.bank_account_id) {
      try {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('id', payroll.bank_account_id)
          .single();
        
        if (!error && data) {
          bankAccount = data as BankAccount;
        }
      } catch (error) {
        console.error('Error fetching bank account:', error);
      }
    }

    setSelectedPayroll(payroll);
    setSelectedProfile(profile);
    setSelectedBankAccount(bankAccount);
    setIsDetailsOpen(true);
  };

  const totalPayroll = filteredPayrolls.reduce((sum, p) => sum + p.net_pay, 0);
  const pendingPayrolls = filteredPayrolls.filter(p => p.status === 'pending').length;
  const paidPayrolls = filteredPayrolls.filter(p => p.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payrolls</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredPayrolls.length}</div>
            <p className="text-xs text-muted-foreground">Records found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPayroll.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Net pay total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingPayrolls}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidPayrolls}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by employee name, email, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Pay Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Gross Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Net Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((payroll) => {
                  const profile = profiles.find(p => p.id === payroll.profile_id);
                  if (!profile) return null;

                  return (
                    <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{profile.full_name}</div>
                          <div className="text-sm text-gray-600">{profile.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{new Date(payroll.pay_period_start).toLocaleDateString()}</div>
                          <div className="text-gray-600">to {new Date(payroll.pay_period_end).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{payroll.total_hours}h</td>
                      <td className="py-3 px-4">${payroll.gross_pay.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-green-600">${payroll.net_pay.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          payroll.status === 'paid' ? 'default' :
                          payroll.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {payroll.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(payroll)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No payroll records found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Details Dialog */}
      <PayrollDetailsDialog
        payroll={selectedPayroll}
        profile={selectedProfile}
        bankAccount={selectedBankAccount}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPayroll(null);
          setSelectedProfile(null);
          setSelectedBankAccount(null);
        }}
      />
    </div>
  );
};
