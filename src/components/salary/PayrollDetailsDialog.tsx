
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, DollarSign, Calendar, User, Building2 } from "lucide-react";
import { Payroll } from "@/types/database";

interface PayrollDetailsDialogProps {
  payroll: Payroll | null;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export const PayrollDetailsDialog = ({ payroll, onOpenChange, onRefresh }: PayrollDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange(false);
  };

  // Early return if payroll is null
  if (!payroll) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text version for download
    const content = `
PAYROLL DETAILS
================
Employee: ${payroll.profiles?.full_name || 'N/A'}
Pay Period: ${payroll.pay_period_start} to ${payroll.pay_period_end}
Total Hours: ${payroll.total_hours}
Hourly Rate: $${payroll.hourly_rate}
Gross Pay: $${payroll.gross_pay}
Deductions: $${payroll.deductions}
Net Pay: $${payroll.net_pay}
Status: ${payroll.status}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${payroll.profiles?.full_name || 'employee'}-${payroll.pay_period_start}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payroll Details - {payroll.profiles?.full_name || 'Employee'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="font-semibold">{payroll.profiles?.full_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p>{payroll.profiles?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p>{payroll.profiles?.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Employment Type</label>
                <p>{payroll.profiles?.employment_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p>{payroll.profiles?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p>{payroll.profiles?.full_address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Pay Period & Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Pay Period Start</label>
                <p className="font-semibold">{payroll.pay_period_start}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pay Period End</label>
                <p className="font-semibold">{payroll.pay_period_end}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Hours</label>
                <p className="font-semibold">{payroll.total_hours}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Hourly Rate</label>
                <p className="font-semibold">${payroll.hourly_rate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Calculation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Payment Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Gross Pay</p>
                  <p className="text-2xl font-bold text-blue-600">${payroll.gross_pay}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Deductions</p>
                  <p className="text-2xl font-bold text-red-600">${payroll.deductions}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Net Pay</p>
                  <p className="text-2xl font-bold text-green-600">${payroll.net_pay}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Information */}
          {payroll.bank_accounts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-4 w-4" />
                  Bank Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Name</label>
                  <p className="font-semibold">{payroll.bank_accounts.bank_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Number</label>
                  <p className="font-semibold">{payroll.bank_accounts.account_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Holder</label>
                  <p className="font-semibold">{payroll.bank_accounts.account_holder_name}</p>
                </div>
                {payroll.bank_accounts.bsb_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">BSB Code</label>
                    <p className="font-semibold">{payroll.bank_accounts.bsb_code}</p>
                  </div>
                )}
                {payroll.bank_accounts.swift_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">SWIFT Code</label>
                    <p className="font-semibold">{payroll.bank_accounts.swift_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
