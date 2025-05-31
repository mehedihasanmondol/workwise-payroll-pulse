
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { EmployeeManagement } from "@/components/EmployeeManagement";
import { ClientManagement } from "@/components/ClientManagement";
import { ProjectManagement } from "@/components/ProjectManagement";
import { WorkingHours } from "@/components/WorkingHours";
import { Roster } from "@/components/Roster";
import { PayrollComponent } from "@/components/Payroll";
import { BankBalance } from "@/components/BankBalance";
import { Reports } from "@/components/Reports";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        return <EmployeeManagement />;
      case "clients":
        return <ClientManagement />;
      case "projects":
        return <ProjectManagement />;
      case "working-hours":
        return <WorkingHours />;
      case "roster":
        return <Roster />;
      case "payroll":
        return <PayrollComponent />;
      case "bank-balance":
        return <BankBalance />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Schedule & Payroll Manager</h1>
            <Link to="/employee">
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Portal
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
