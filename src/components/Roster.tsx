import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkingHour, Profile, Client, Project } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { ProfileSelector } from "@/components/common/ProfileSelector";

export const Roster = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    profile_id: "",
    client_id: "",
    project_id: "",
    date: "",
    start_time: "",
    end_time: "",
    status: "pending"
  });

  useEffect(() => {
    fetchWorkingHours();
    fetchProfiles();
    fetchClients();
    fetchProjects();
  }, [selectedDate]);

  const fetchWorkingHours = async () => {
    try {
      const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('working_hours')
        .select(`
          *,
          profiles (id, full_name, role),
          clients (id, company),
          projects (id, name)
        `)
        .eq('date', dateStr)
        .order('start_time');

      if (error) throw error;
      setWorkingHours(data as WorkingHour[]);
    } catch (error) {
      console.error('Error fetching working hours:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roster data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('company');

      if (error) throw error;
      setClients(data as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const calculateTotalHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, diffHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalHours = calculateTotalHours(formData.start_time, formData.end_time);
      
      const { error } = await supabase
        .from('working_hours')
        .insert([{
          ...formData,
          total_hours: totalHours
        }]);

      if (error) throw error;
      toast({ title: "Success", description: "Roster entry added successfully" });
      
      setIsDialogOpen(false);
      setFormData({
        profile_id: "",
        client_id: "",
        project_id: "",
        date: "",
        start_time: "",
        end_time: "",
        status: "pending"
      });
      fetchWorkingHours();
    } catch (error) {
      console.error('Error saving roster entry:', error);
      toast({
        title: "Error",
        description: "Failed to save roster entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfileHours = (profileId: string) => {
    return workingHours.filter(wh => wh.profile_id === profileId);
  };

  const getTotalHoursForDay = () => {
    return workingHours.reduce((total, wh) => total + wh.total_hours, 0);
  };

  if (loading && workingHours.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Roster Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => {
              setFormData({
                profile_id: "",
                client_id: "",
                project_id: "",
                date: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
                start_time: "",
                end_time: "",
                status: "pending"
              });
            }}>
              <Plus className="h-4 w-4" />
              Add Roster Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Roster Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Enhanced Profile Selection */}
              <ProfileSelector
                profiles={profiles}
                selectedProfileId={formData.profile_id}
                onProfileSelect={(profileId) => setFormData({ ...formData, profile_id: profileId })}
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Add Roster Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Schedule - {selectedDate?.toDateString()}
              </CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getTotalHoursForDay().toFixed(1)}h total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.map((profile) => {
                const profileHours = getProfileHours(profile.id);
                const totalHours = profileHours.reduce((sum, wh) => sum + wh.total_hours, 0);
                
                return (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{profile.full_name}</h4>
                        <p className="text-sm text-gray-600">{profile.role}</p>
                      </div>
                      <Badge variant="outline">{totalHours.toFixed(1)}h</Badge>
                    </div>
                    
                    {profileHours.length > 0 ? (
                      <div className="space-y-2">
                        {profileHours.map((hour) => (
                          <div key={hour.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{hour.start_time} - {hour.end_time}</span>
                              <span className="text-sm text-gray-600">({hour.total_hours}h)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{hour.projects?.name}</span>
                              <Badge variant={hour.status === "approved" ? "default" : hour.status === "pending" ? "secondary" : "outline"} className="text-xs">
                                {hour.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No scheduled hours</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
