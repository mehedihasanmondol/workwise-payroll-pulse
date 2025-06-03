
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Roster, Profile, Client, Project } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { MultipleProfileSelector } from "@/components/common/MultipleProfileSelector";

interface RosterProps {
  rosters: Roster[];
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  onRefresh: () => void;
}

export const RosterComponent = ({ rosters, profiles, clients, projects, onRefresh }: RosterProps) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    project_id: "",
    date: "",
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    expected_profiles: 1,
    per_hour_rate: 0,
    notes: ""
  });

  const calculateTotalHours = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProfiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one team member",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const totalHours = calculateTotalHours(formData.start_time, formData.end_time);
      
      const rosterData = selectedProfiles.map(profileId => ({
        profile_id: profileId,
        client_id: formData.client_id,
        project_id: formData.project_id,
        date: formData.date,
        end_date: formData.end_date || formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_hours: totalHours,
        notes: formData.notes,
        status: 'pending' as const,
        name: formData.name,
        expected_profiles: formData.expected_profiles,
        per_hour_rate: formData.per_hour_rate
      }));

      const { error } = await supabase.from('rosters').insert(rosterData);
      if (error) throw error;

      toast({ title: "Success", description: "Roster created successfully" });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        client_id: "",
        project_id: "",
        date: "",
        end_date: "",
        start_time: "09:00",
        end_time: "17:00",
        expected_profiles: 1,
        per_hour_rate: 0,
        notes: ""
      });
      setSelectedProfiles([]);
      onRefresh();
    } catch (error: any) {
      console.error('Error creating roster:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create roster",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRosters = rosters.filter(roster =>
    roster.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roster.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roster.clients?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Roster Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search rosters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roster
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Roster</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Roster Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Morning Shift"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="expected_profiles">Expected Team Members</Label>
                      <Input
                        id="expected_profiles"
                        type="number"
                        min="1"
                        value={formData.expected_profiles}
                        onChange={(e) => setFormData({ ...formData, expected_profiles: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_id">Client *</Label>
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
                      <Label htmlFor="project_id">Project *</Label>
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
                      <Label htmlFor="date">Start Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.date}
                      />
                    </div>

                    <div>
                      <Label htmlFor="start_time">Start Time *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_time">End Time *</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="per_hour_rate">Per Hour Rate ($)</Label>
                      <Input
                        id="per_hour_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.per_hour_rate}
                        onChange={(e) => setFormData({ ...formData, per_hour_rate: parseFloat(e.target.value) || 0 })}
                        placeholder="Leave 0 to use profile rate"
                      />
                    </div>
                  </div>

                  <div>
                    <MultipleProfileSelector
                      profiles={profiles}
                      selectedProfiles={selectedProfiles}
                      onProfileSelect={setSelectedProfiles}
                      label="Select Team Members *"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this roster..."
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Roster"}
                  </Button>
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Roster</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Team Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRosters.map((roster) => (
                <tr key={roster.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{roster.name || 'Unnamed Roster'}</div>
                      {roster.notes && <div className="text-sm text-gray-600">{roster.notes}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {roster.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {roster.clients?.company || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {roster.projects?.name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(roster.date).toLocaleDateString()}
                      {roster.end_date && roster.end_date !== roster.date && (
                        <span> - {new Date(roster.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {roster.start_time} - {roster.end_time}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {roster.total_hours}h
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roster.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : roster.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {roster.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRosters.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No rosters found</p>
                    <p className="text-sm">Create a roster to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
