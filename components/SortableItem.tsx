import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface SortableItemProps {
  id: number | string;
  children:
    | ReactNode
    | ((listeners: SyntheticListenerMap | undefined) => ReactNode);
  className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes}>
      {typeof children === "function" ? children(listeners) : children}
    </div>
  );
}
