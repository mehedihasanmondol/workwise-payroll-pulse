
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { Check, Edit, Trash2, Eye } from "lucide-react";
import { WorkingHour } from "@/types/database";

interface WorkingHoursActionsProps {
  workingHour: WorkingHour;
  onEdit: (workingHour: WorkingHour) => void;
  onRefresh: () => void;
}

export const WorkingHoursActions = ({
  workingHour,
  onEdit,
  onRefresh
}: WorkingHoursActionsProps) => {
  const handleApprove = async (id: string) => {
    // Implementation for approval
    console.log('Approving working hour:', id);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    // Implementation for deletion
    console.log('Deleting working hour:', id);
    onRefresh();
  };

  const handleView = (id: string) => {
    // Implementation for viewing details
    console.log('Viewing working hour:', id);
  };

  if (workingHour.status === 'pending') {
    return (
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleApprove(workingHour.id)}
        >
          <Check className="h-4 w-4 mr-1" />
          Mark as Approved
        </Button>
        <ActionDropdown
          items={[
            {
              label: "Edit",
              onClick: () => onEdit(workingHour),
              icon: <Edit className="h-4 w-4" />
            },
            {
              label: "Delete",
              onClick: () => handleDelete(workingHour.id),
              icon: <Trash2 className="h-4 w-4" />,
              variant: "destructive"
            },
            {
              label: "View Details",
              onClick: () => handleView(workingHour.id),
              icon: <Eye className="h-4 w-4" />
            }
          ]}
        />
      </div>
    );
  }

  return (
    <ActionDropdown
      items={[
        {
          label: "View Details",
          onClick: () => handleView(workingHour.id),
          icon: <Eye className="h-4 w-4" />
        }
      ]}
    />
  );
};
