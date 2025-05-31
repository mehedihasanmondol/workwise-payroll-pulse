
import { useState } from "react";
import { EmployeeAuth } from "@/components/EmployeeAuth";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";
import { Employee } from "@/types/database";

const EmployeePortal = () => {
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(null);

  const handleLogin = (employee: Employee) => {
    setLoggedInEmployee(employee);
  };

  const handleLogout = () => {
    setLoggedInEmployee(null);
  };

  return (
    <>
      {loggedInEmployee ? (
        <EmployeeDashboard employee={loggedInEmployee} onLogout={handleLogout} />
      ) : (
        <EmployeeAuth onLogin={handleLogin} />
      )}
    </>
  );
};

export default EmployeePortal;
