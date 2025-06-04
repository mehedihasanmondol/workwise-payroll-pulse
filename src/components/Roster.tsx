import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EnhancedProfileSelector } from "./salary/EnhancedProfileSelector";
import { Profile, Client, Project } from "@/types/database";

interface RosterProps {
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  onRefresh: () => void;
}

export const Roster = ({ profiles, clients, projects, onRefresh }: RosterProps) => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [timeRange, setTimeRange] = useState({
    start: '09:00',
    end: '17:00'
  });
  const [notes, setNotes] = useState("");
  const [rosterName, setRosterName] = useState("");
  const [perHourRate, setPerHourRate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clients.length > 0) {
      setSelectedClient(clients[0].id);
    }
    if (projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [clients, projects]);

  const calculateTotalHours = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    let diffInMinutes = endTimeInMinutes - startTimeInMinutes;
    if (diffInMinutes < 0) {
      diffInMinutes += 24 * 60;
    }
    return (diffInMinutes / 60).toFixed(2);
  };

  const resetForm = () => {
    setSelectedProfiles([]);
    setDateRange({ from: new Date(), to: new Date() });
    setTimeRange({ start: '09:00', end: '17:00' });
    setNotes("");
    setRosterName("");
    setPerHourRate("");
  };

  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      const rosterData = selectedProfiles.map((profileId) => ({
        profile_id: profileId,
        client_id: selectedClient,
        project_id: selectedProject,
        date: dateRange.from?.toISOString().split('T')[0],
        end_date: dateRange.to?.toISOString().split('T')[0],
        start_time: timeRange.start,
        end_time: timeRange.end,
        total_hours: parseFloat(calculateTotalHours(timeRange.start, timeRange.end)),
        notes: notes,
        status: 'pending' as const,
        name: rosterName,
        expected_profiles: selectedProfiles.length,
        per_hour_rate: parseFloat(perHourRate) || 0
      }));

      const { error } = await supabase
        .from('rosters')
        .insert(rosterData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${rosterData.length} roster entries successfully`
      });

      onRefresh();
      resetForm();
    } catch (error) {
      console.error('Error creating rosters:', error);
      toast({
        title: "Error",
        description: "Failed to create roster entries",
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
          <CardTitle>Bulk Roster Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Roster Name</Label>
              <Input
                type="text"
                value={rosterName}
                onChange={(e) => setRosterName(e.target.value)}
                placeholder="e.g., 'Weekend Team A'"
              />
            </div>
            <div>
              <Label>Per Hour Rate</Label>
              <Input
                type="number"
                value={perHourRate}
                onChange={(e) => setPerHourRate(e.target.value)}
                placeholder="Enter rate"
              />
            </div>
          </div>

          <div>
            <Label>Select Team Members</Label>
            <EnhancedProfileSelector
              profiles={profiles}
              selectedProfileIds={selectedProfiles}
              onProfileSelect={setSelectedProfiles}
              mode="multiple"
              label="Select Team Members"
              showStats={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
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
              <Label>Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
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
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.from?.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.to?.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <Button 
            onClick={handleBulkCreate} 
            disabled={loading || selectedProfiles.length === 0}
            className="w-full"
          >
            {loading ? "Creating..." : `Create ${selectedProfiles.length} Roster Entries`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
