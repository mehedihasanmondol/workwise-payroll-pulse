import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProfileSelector } from "@/components/ProfileSelector";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Client, Project, Roster } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from 'date-fns';

const RosterComponent = () => {
  const [formData, setFormData] = useState({
    profile_id: "",
    client_id: "",
    project_id: "",
    date: new Date(),
    end_date: new Date(),
    start_time: "09:00",
    end_time: "17:00",
    total_hours: "8",
    notes: "",
    name: "",
    expected_profiles: 1,
    per_hour_rate: ""
  });
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [rostersRes, profilesRes, clientsRes, projectsRes] = await Promise.all([
        supabase.from('rosters').select('*').order('date', { ascending: false }),
        supabase.from('profiles').select('*').eq('is_active', true).order('full_name'),
        supabase.from('clients').select('*').order('name'),
        supabase.from('projects').select('*').order('name')
      ]);

      if (rostersRes.error) throw rostersRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setRosters(rostersRes.data as Roster[]);
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

  const handleSelectChange = (e: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: e }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date: date }));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, end_date: date }));
    }
  };

  const createRoster = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('rosters')
        .insert({
          profile_id: formData.profile_id,
          client_id: formData.client_id,
          project_id: formData.project_id,
          date: formData.date,
          end_date: formData.end_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          total_hours: parseFloat(formData.total_hours),
          notes: formData.notes,
          status: 'pending',
          name: formData.name,
          expected_profiles: formData.expected_profiles,
          per_hour_rate: parseFloat(formData.per_hour_rate || '0')
        })
        .select();

      if (error) throw error;

      setRosters(prev => [...prev, ...(data as Roster[])]);
      toast({
        title: "Success",
        description: "Roster created successfully"
      });
      setFormData({
        profile_id: "",
        client_id: "",
        project_id: "",
        date: new Date(),
        end_date: new Date(),
        start_time: "09:00",
        end_time: "17:00",
        total_hours: "8",
        notes: "",
        name: "",
        expected_profiles: 1,
        per_hour_rate: ""
      });
    } catch (error: any) {
      console.error("Error creating roster:", error);
      toast({
        title: "Error",
        description: "Failed to create roster",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMultipleRosters = async () => {
    try {
      setLoading(true);
      
      const rostersToCreate = selectedProfiles.map((profileId) => ({
        profile_id: profileId,
        client_id: formData.client_id,
        project_id: formData.project_id,
        date: formData.date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_hours: parseFloat(formData.total_hours),
        notes: formData.notes,
        status: 'pending' as const,
        name: formData.name,
        expected_profiles: formData.expected_profiles,
        per_hour_rate: parseFloat(formData.per_hour_rate || '0')
      }));

      const { data, error } = await supabase
        .from('rosters')
        .insert(rostersToCreate)
        .select();

      if (error) throw error;

      setRosters(prev => [...prev, ...(data as Roster[])]);
      toast({
        title: "Success",
        description: "Rosters created successfully for selected profiles"
      });
    } catch (error: any) {
      console.error("Error creating multiple rosters:", error);
      toast({
        title: "Error",
        description: "Failed to create rosters for selected profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Roster Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="expected_profiles">Expected Profiles</Label>
              <Input
                type="number"
                id="expected_profiles"
                name="expected_profiles"
                value={formData.expected_profiles}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <ProfileSelector
            profiles={profiles}
            selectedProfileIds={selectedProfiles}
            onProfileSelect={setSelectedProfiles}
            mode="multiple"
            label="Select Profiles"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select onValueChange={(e) => handleSelectChange(e, "client_id")}>
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
              <Select onValueChange={(e) => handleSelectChange(e, "project_id")}>
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
              <Label>Date</Label>
              <DatePicker onSelect={handleDateChange} />
            </div>
            <div>
              <Label>End Date</Label>
              <DatePicker onSelect={handleEndDateChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="total_hours">Total Hours</Label>
              <Input
                type="number"
                id="total_hours"
                name="total_hours"
                value={formData.total_hours}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="per_hour_rate">Per Hour Rate</Label>
            <Input
              type="number"
              id="per_hour_rate"
              name="per_hour_rate"
              value={formData.per_hour_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              type="textarea"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <Button onClick={createMultipleRosters} disabled={loading}>
            {loading ? "Creating..." : "Create Roster for Selected Profiles"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster List</CardTitle>
        </CardHeader>
        <CardContent>
          {rosters.length === 0 ? (
            <p>No rosters created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rosters.map((roster) => (
                    <tr key={roster.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{roster.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profiles.find(profile => profile.id === roster.profile_id)?.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {clients.find(client => client.id === roster.client_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {projects.find(project => project.id === roster.project_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(roster.date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{roster.total_hours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roster.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RosterComponent;
