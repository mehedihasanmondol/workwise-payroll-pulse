
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "deposit" | "withdrawal";
  category: string;
}

export const BankBalance = () => {
  const [currentBalance] = useState(24580);
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      date: "2024-05-29",
      description: "Client payment - ABC Corporation",
      amount: 5000,
      type: "deposit",
      category: "Revenue"
    },
    {
      id: 2,
      date: "2024-05-28",
      description: "Payroll - Week ending 05/25",
      amount: 3200,
      type: "withdrawal",
      category: "Payroll"
    },
    {
      id: 3,
      date: "2024-05-27",
      description: "Office supplies",
      amount: 150,
      type: "withdrawal",
      category: "Expenses"
    },
    {
      id: 4,
      date: "2024-05-26",
      description: "Client payment - XYZ Industries",
      amount: 7500,
      type: "deposit",
      category: "Revenue"
    },
    {
      id: 5,
      date: "2024-05-25",
      description: "Software subscription",
      amount: 299,
      type: "withdrawal",
      category: "Technology"
    }
  ]);

  const totalDeposits = transactions
    .filter(t => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bank Balance</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Deposit
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Add Withdrawal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
            <Wallet className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${currentBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">As of today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deposits</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${totalDeposits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Withdrawals</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{transaction.date}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{transaction.description}</td>
                    <td className="py-3 px-4 text-gray-600">{transaction.category}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={transaction.type === "deposit" ? "default" : "secondary"}
                        className={transaction.type === "deposit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString()}
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
