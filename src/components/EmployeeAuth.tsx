
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface EmployeeAuthProps {
  onLogin: (employee: Employee) => void;
}

export const EmployeeAuth = ({ onLogin }: EmployeeAuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if employee exists with this email
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (employeeError || !employee) {
        toast({
          title: "Login Failed",
          description: "Employee not found or inactive",
          variant: "destructive"
        });
        return;
      }

      // For demo purposes, we'll use a simple password check
      // In production, you'd want proper authentication
      if (password === "password123") {
        onLogin(employee);
        toast({
          title: "Welcome!",
          description: `Logged in as ${employee.name}`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Employee Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Demo password: password123</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Logging in..." : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
