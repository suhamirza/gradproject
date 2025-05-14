import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableItemProps {
  id: string;
  text: string;
  details?: string;
  deadline?: string;
  assignedTo?: string;
  attachments?: string[];
  onViewDetails: () => void;
}

export const SortableItem = ({ id, text, onViewDetails }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'task'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    touchAction: 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-purple-100 text-gray-800 p-3 rounded-lg shadow hover:bg-purple-200 transition-colors mb-2 relative"
    >
      <div className="pr-6 mb-4">{text}</div>
      <button
        className="absolute bottom-2 right-2 p-1 hover:bg-purple-300 rounded transition-colors"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onViewDetails();
        }}
        title="View details"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
    </div>
  );
};
