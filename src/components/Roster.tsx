import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from 'date-fns';
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Client, Project } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { EnhancedProfileSelector } from "./salary/EnhancedProfileSelector";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
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
      
      const rosterData = selectedProfiles.map(profileId => ({
        profile_id: profileId,
        client_id: selectedClient,
        project_id: selectedProject,
        date: dateRange.from?.toISOString().split('T')[0],
        end_date: dateRange.to?.toISOString().split('T')[0],
        start_time: timeRange.start,
        end_time: timeRange.end,
        total_hours: calculateTotalHours(timeRange.start, timeRange.end),
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
    } catch (error: any) {
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company || client.name}
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

            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={format(dateRange?.from as Date, 'PPP') === format(dateRange?.to as Date, 'PPP') ? "justify-start text-left font-normal text-[0.9rem] w-full" : "justify-start text-left font-normal text-[0.9rem]"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      format(dateRange.from, "PPP") === format(dateRange.to as Date, "PPP") ? format(dateRange.from, "PPP") : `${format(dateRange.from, "PPP")} - ${format(dateRange.to as Date, "PPP")}`
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <Label>Notes</Label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the roster"
            />
          </div>

          <Separator />

          <Button onClick={handleBulkCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Roster Entries"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
