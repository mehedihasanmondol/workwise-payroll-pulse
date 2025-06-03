
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkingHour, Profile, Client, Project, WorkingHoursStatus } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { ProfileSelector } from "@/components/common/ProfileSelector";
import { EditWorkingHoursDialog } from "@/components/EditWorkingHoursDialog";
import { WorkingHoursActions } from "@/components/working-hours/WorkingHoursActions";

interface WorkingHoursProps {
  workingHours: WorkingHour[];
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  onRefresh: () => void;
}

export const WorkingHoursComponent = ({ workingHours, profiles, clients, projects, onRefresh }: WorkingHoursProps) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkingHour, setSelectedWorkingHour] = useState<WorkingHour | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    profile_id: "",
    client_id: "",
    project_id: "",
    date: "",
    start_time: "09:00",
    end_time: "17:00",
    sign_in_time: "",
    sign_out_time: "",
    hourly_rate: 0,
    notes: ""
  });

  const calculateTotalHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, diffHours);
  };

  const calculateActualHours = (signInTime: string, signOutTime: string) => {
    if (!signInTime || !signOutTime) return 0;
    return calculateTotalHours(signInTime, signOutTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalHours = calculateTotalHours(formData.start_time, formData.end_time);
      const actualHours = calculateActualHours(formData.sign_in_time, formData.sign_out_time);
      const overtimeHours = Math.max(0, actualHours - totalHours);
      const payableAmount = (actualHours > 0 ? actualHours : totalHours) * formData.hourly_rate;
      
      const workingHoursData = [{
        profile_id: formData.profile_id,
        client_id: formData.client_id,
        project_id: formData.project_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_hours: totalHours,
        actual_hours: actualHours,
        overtime_hours: overtimeHours,
        payable_amount: payableAmount,
        sign_in_time: formData.sign_in_time || null,
        sign_out_time: formData.sign_out_time || null,
        hourly_rate: formData.hourly_rate,
        notes: formData.notes,
        status: 'pending' as const
      }];

      const { error } = await supabase.from('working_hours').insert(workingHoursData);
      if (error) throw error;

      toast({ title: "Success", description: "Working hours created successfully" });
      setIsDialogOpen(false);
      setFormData({
        profile_id: "",
        client_id: "",
        project_id: "",
        date: "",
        start_time: "09:00",
        end_time: "17:00",
        sign_in_time: "",
        sign_out_time: "",
        hourly_rate: 0,
        notes: ""
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error creating working hours:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create working hours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workingHour: WorkingHour) => {
    setSelectedWorkingHour(workingHour);
    setIsEditDialogOpen(true);
  };

  const filteredWorkingHours = workingHours.filter(wh => {
    const matchesSearch = 
      wh.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.clients?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || wh.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Working Hours Management</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search working hours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hours
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Working Hours</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <ProfileSelector
                      profiles={profiles}
                      selectedProfileId={formData.profile_id}
                      onProfileSelect={(profileId) => {
                        const profile = profiles.find(p => p.id === profileId);
                        setFormData({ 
                          ...formData, 
                          profile_id: profileId,
                          hourly_rate: profile?.hourly_rate || 0
                        });
                      }}
                      label="Select Profile"
                      placeholder="Choose a team member"
                      showRoleFilter={true}
                    />
                    
                    <div>
                      <Label htmlFor="client_id">Client</Label>
                      <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="project_id">Project</Label>
                      <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.filter(p => !formData.client_id || p.client_id === formData.client_id).map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Scheduled Hours</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                              id="start_time"
                              type="time"
                              value={formData.start_time}
                              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                              id="end_time"
                              type="time"
                              value={formData.end_time}
                              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Actual Hours (Optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sign_in_time">Sign In Time</Label>
                            <Input
                              id="sign_in_time"
                              type="time"
                              value={formData.sign_in_time}
                              onChange={(e) => setFormData({ ...formData, sign_in_time: e.target.value })}
                              placeholder="Leave empty if not available"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sign_out_time">Sign Out Time</Label>
                            <Input
                              id="sign_out_time"
                              type="time"
                              value={formData.sign_out_time}
                              onChange={(e) => setFormData({ ...formData, sign_out_time: e.target.value })}
                              placeholder="Leave empty if not available"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes about this work session..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Hours"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkingHours.map((wh) => (
                  <tr key={wh.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{wh.profiles?.full_name}</div>
                        <div className="text-sm text-gray-600">{wh.profiles?.role}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {wh.clients?.company}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {wh.projects?.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(wh.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {wh.start_time} - {wh.end_time}
                        </div>
                        <div className="font-medium">
                          {wh.actual_hours > 0 ? `${wh.actual_hours}h` : `${wh.total_hours}h`}
                          {wh.overtime_hours > 0 && (
                            <span className="text-orange-600 ml-1">(+{wh.overtime_hours}h OT)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {wh.hourly_rate.toFixed(2)}/hr
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      ${wh.payable_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        wh.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : wh.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : wh.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wh.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <WorkingHoursActions
                        workingHour={wh}
                        onEdit={handleEdit}
                        onRefresh={onRefresh}
                      />
                    </td>
                  </tr>
                ))}
                {filteredWorkingHours.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No working hours found</p>
                      <p className="text-sm">Add working hours to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <EditWorkingHoursDialog
        workingHour={selectedWorkingHour}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedWorkingHour(null);
        }}
        onUpdate={onRefresh}
        profiles={profiles}
        clients={clients}
        projects={projects}
      />
    </div>
  );
};

export { WorkingHoursComponent as WorkingHours };
