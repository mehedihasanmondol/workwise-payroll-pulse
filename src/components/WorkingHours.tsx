import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile, Client, Project } from "@/types/database";

interface WorkingHoursProps {
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  onRefresh: () => void;
}

export const WorkingHours = ({ profiles, clients, projects, onRefresh }: WorkingHoursProps) => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState({
    start: '09:00',
    end: '17:00'
  });
  const [hourlyRate, setHourlyRate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateTotalHours = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    let diffInMinutes = endTimeInMinutes - startTimeInMinutes;
    if (diffInMinutes < 0) {
      diffInMinutes += 24 * 60;
    }
    return diffInMinutes / 60;
  };

  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      const totalHours = calculateTotalHours(timeRange.start, timeRange.end);
      const rate = parseFloat(hourlyRate) || 0;
      
      const workingHoursData = selectedProfiles.map((profileId) => ({
        profile_id: profileId,
        client_id: selectedClient,
        project_id: selectedProject,
        date: date,
        start_time: timeRange.start,
        end_time: timeRange.end,
        total_hours: totalHours,
        actual_hours: totalHours,
        overtime_hours: 0,
        hourly_rate: rate,
        payable_amount: totalHours * rate,
        sign_in_time: timeRange.start,
        sign_out_time: timeRange.end,
        notes: notes,
        status: 'pending' as const
      }));

      const { error } = await supabase
        .from('working_hours')
        .insert(workingHoursData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${workingHoursData.length} working hour entries successfully`
      });

      onRefresh();
      // Reset form
      setSelectedProfiles([]);
      setNotes("");
      setHourlyRate("");
    } catch (error) {
      console.error('Error creating working hours:', error);
      toast({
        title: "Error",
        description: "Failed to create working hour entries",
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
          <CardTitle>Bulk Working Hours Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Employees</Label>
            <Select onValueChange={(value) => setSelectedProfiles([...selectedProfiles, value])}>
              <SelectTrigger>
                <SelectValue placeholder="Select employees" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              Selected: {selectedProfiles.length} employees
            </div>
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

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
            <Label>Hourly Rate</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
            />
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
            {loading ? "Creating..." : `Create Working Hours for ${selectedProfiles.length} Employees`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
