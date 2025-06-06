
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { Check, Edit, Trash2, Eye } from "lucide-react";
import { WorkingHour } from "@/types/database";

interface WorkingHoursActionsProps {
  workingHour: WorkingHour;
  onApprove: (id: string) => void;
  onEdit: (workingHour: WorkingHour) => void;
  onDelete: (id: string) => void;
  onView: (workingHour: WorkingHour) => void;
}

export const WorkingHoursActions = ({
  workingHour,
  onApprove,
  onEdit,
  onDelete,
  onView
}: WorkingHoursActionsProps) => {
  const canEditDelete = workingHour.status !== 'paid';

  if (workingHour.status === 'pending') {
    return (
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onApprove(workingHour.id)}
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
              onClick: () => onDelete(workingHour.id),
              icon: <Trash2 className="h-4 w-4" />,
              variant: "destructive" as const
            },
            {
              label: "View Details",
              onClick: () => onView(workingHour),
              icon: <Eye className="h-4 w-4" />
            }
          ]}
        />
      </div>
    );
  }

  const items = [
    {
      label: "View Details",
      onClick: () => onView(workingHour),
      icon: <Eye className="h-4 w-4" />
    }
  ];

  if (canEditDelete) {
    items.unshift(
      {
        label: "Edit",
        onClick: () => onEdit(workingHour),
        icon: <Edit className="h-4 w-4" />
      },
      {
        label: "Delete",
        onClick: () => onDelete(workingHour.id),
        icon: <Trash2 className="h-4 w-4" />,
        variant: "destructive" as const
      }
    );
  }

  return <ActionDropdown items={items} />;
};
