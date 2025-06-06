
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Building, FolderOpen, DollarSign, Calendar, Timer } from "lucide-react";
import { WorkingHour } from "@/types/database";
import { format, parseISO } from "date-fns";

interface WorkingHoursViewDialogProps {
  workingHour: WorkingHour | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkingHoursViewDialog = ({ workingHour, isOpen, onClose }: WorkingHoursViewDialogProps) => {
  if (!workingHour) return null;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), 'MMMM dd, yyyy');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Working Hours Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formatDate(workingHour.date)}
                </h3>
                <div className="mt-2">
                  <Badge variant={
                    workingHour.status === "approved" ? "default" : 
                    workingHour.status === "pending" ? "secondary" : 
                    workingHour.status === "paid" ? "default" : "outline"
                  }>
                    {workingHour.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Employee</div>
                  <div className="text-sm text-gray-600">
                    {workingHour.profiles?.full_name || 'Unknown Employee'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {workingHour.profiles?.role || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Client</div>
                  <div className="text-sm text-gray-600">
                    {workingHour.clients?.company || 'No Client'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Project</div>
                  <div className="text-sm text-gray-600">
                    {workingHour.projects?.name || 'No Project'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Date</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(workingHour.date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Time Details</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-700 text-sm">Scheduled Hours</div>
                  <div className="text-sm text-gray-600">
                    {formatTime(workingHour.start_time)} - {formatTime(workingHour.end_time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {workingHour.total_hours} hours
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-700 text-sm">Actual Hours</div>
                  {workingHour.sign_in_time && workingHour.sign_out_time ? (
                    <div>
                      <div className="text-sm text-gray-600">
                        {formatTime(workingHour.sign_in_time)} - {formatTime(workingHour.sign_out_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {workingHour.actual_hours || 0} hours
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not recorded</div>
                  )}
                </div>
              </div>
            </div>

            {(workingHour.overtime_hours && workingHour.overtime_hours > 0) && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800 text-sm">Overtime Hours</div>
                <div className="text-sm text-orange-700">
                  {workingHour.overtime_hours} hours overtime
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Payment Details</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">
                  ${(workingHour.hourly_rate || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Hourly Rate</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">
                  {workingHour.actual_hours || workingHour.total_hours}h
                </div>
                <div className="text-xs text-gray-600">Billable Hours</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-700">
                  ${(workingHour.payable_amount || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Total Amount</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {workingHour.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Notes</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {workingHour.notes}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
