
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Client, Project, WorkingHour } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { EditWorkingHoursDialog } from "./EditWorkingHoursDialog";

const WorkingHours = () => {
  const [formData, setFormData] = useState({
    profile_id: "",
    client_id: "",
    project_id: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "17:00",
    sign_in_time: "09:00",
    sign_out_time: "17:00",
    hourly_rate: "",
    notes: ""
  });

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWorkingHour, setEditingWorkingHour] = useState<WorkingHour | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [workingHoursRes, profilesRes, clientsRes, projectsRes] = await Promise.all([
        supabase
          .from('working_hours')
          .select(`
            *,
            profiles!working_hours_profile_id_fkey (id, full_name, role),
            clients!working_hours_client_id_fkey (id, name, company),
            projects!working_hours_project_id_fkey (id, name)
          `)
          .order('date', { ascending: false }),
        supabase.from('profiles').select('*').eq('is_active', true).order('full_name'),
        supabase.from('clients').select('*').order('name'),
        supabase.from('projects').select('*').order('name')
      ]);

      if (workingHoursRes.error) throw workingHoursRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setWorkingHours(workingHoursRes.data as WorkingHour[]);
      setProfiles(profilesRes.data as Profile[]);
      setClients(clientsRes.data as Client[]);
      setProjects(projectsRes.data as Project[]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  const calculateOvertimeHours = (totalHours: number): number => {
    return Math.max(0, totalHours - 8);
  };

  const submitWorkingHours = async () => {
    try {
      setLoading(true);

      const totalHours = calculateHours(formData.sign_in_time, formData.sign_out_time);
      const actualHours = calculateHours(formData.start_time, formData.end_time);
      const overtimeHours = calculateOvertimeHours(actualHours);
      const hourlyRate = parseFloat(formData.hourly_rate) || 0;
      const payableAmount = actualHours * hourlyRate;

      const workingHourData = {
        profile_id: formData.profile_id,
        client_id: formData.client_id,
        project_id: formData.project_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        sign_in_time: formData.sign_in_time,
        sign_out_time: formData.sign_out_time,
        total_hours: totalHours,
        actual_hours: actualHours,
        overtime_hours: overtimeHours,
        hourly_rate: hourlyRate,
        payable_amount: payableAmount,
        notes: formData.notes,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('working_hours')
        .insert([workingHourData])
        .select(`
          *,
          profiles!working_hours_profile_id_fkey (id, full_name, role),
          clients!working_hours_client_id_fkey (id, name, company),
          projects!working_hours_project_id_fkey (id, name)
        `);

      if (error) throw error;

      setWorkingHours(prev => [...(data as WorkingHour[]), ...prev]);
      toast({
        title: "Success",
        description: "Working hours submitted successfully"
      });

      // Reset form
      setFormData({
        profile_id: "",
        client_id: "",
        project_id: "",
        date: new Date().toISOString().split('T')[0],
        start_time: "09:00",
        end_time: "17:00",
        sign_in_time: "09:00",
        sign_out_time: "17:00",
        hourly_rate: "",
        notes: ""
      });
    } catch (error: any) {
      console.error("Error submitting working hours:", error);
      toast({
        title: "Error",
        description: "Failed to submit working hours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHourStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('working_hours')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setWorkingHours(prev => 
        prev.map(wh => 
          wh.id === id ? { ...wh, status } : wh
        )
      );

      toast({
        title: "Success",
        description: `Working hours ${status} successfully`
      });
    } catch (error: any) {
      console.error(`Error ${status} working hours:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status} working hours`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'paid':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Submit Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="profile_id">Employee</Label>
              <Select onValueChange={(value) => handleSelectChange(value, "profile_id")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select onValueChange={(value) => handleSelectChange(value, "client_id")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project_id">Project</Label>
              <Select onValueChange={(value) => handleSelectChange(value, "project_id")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                type="number"
                id="hourly_rate"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start_time">Work Start Time</Label>
              <Input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="end_time">Work End Time</Label>
              <Input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="sign_in_time">Sign In Time</Label>
              <Input
                type="time"
                id="sign_in_time"
                name="sign_in_time"
                value={formData.sign_in_time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="sign_out_time">Sign Out Time</Label>
              <Input
                type="time"
                id="sign_out_time"
                name="sign_out_time"
                value={formData.sign_out_time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes..."
            />
          </div>

          <Button 
            onClick={submitWorkingHours} 
            disabled={loading || !formData.profile_id || !formData.client_id || !formData.project_id}
          >
            {loading ? "Submitting..." : "Submit Working Hours"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Working Hours Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workingHours.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No working hours records found.</p>
          ) : (
            <div className="space-y-4">
              {workingHours.map((wh) => (
                <Card key={wh.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{(wh as any).profiles?.full_name}</h4>
                        <p className="text-sm text-gray-600">{(wh as any).clients?.company} - {(wh as any).projects?.name}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(wh.status)}>
                        {wh.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(wh.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {wh.start_time} - {wh.end_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${wh.hourly_rate}/hr
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {wh.total_hours}h total
                      </div>
                    </div>

                    {wh.notes && (
                      <p className="text-sm text-gray-600 mt-2">{wh.notes}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      {wh.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateWorkingHourStatus(wh.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateWorkingHourStatus(wh.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingWorkingHour(wh)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingWorkingHour && (
        <EditWorkingHoursDialog
          workingHour={editingWorkingHour}
          profiles={profiles}
          clients={clients}
          projects={projects}
          onClose={() => setEditingWorkingHour(null)}
          onRefresh={fetchAllData}
        />
      )}
    </div>
  );
};

export default WorkingHours;
