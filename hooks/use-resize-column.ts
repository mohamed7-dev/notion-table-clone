import React from "react";
import { Column } from "./use-react-table";

type UseResizeColumn = {
  columns: Column[];
  updateColumns: (columns: Column[]) => void;
};
export function useResizeColumn({ columns, updateColumns }: UseResizeColumn) {
  const [resizingColumn, setResizingColumn] = React.useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find((col) => col.id === columnId);
    if (column) {
      setResizingColumn({
        columnId,
        startX: e.clientX,
        startWidth: column.width || 150,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizingColumn) {
      const diff = e.clientX - resizingColumn.startX;
      const newWidth = Math.max(80, resizingColumn.startWidth + diff);
      updateColumns(
        columns.map((col) =>
          col.id === resizingColumn.columnId ? { ...col, width: newWidth } : col
        )
      );
    }
  };

  const handleMouseUp = () => {
    setResizingColumn(null);
  };

  React.useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizingColumn]);

  return {
    resizingColumn,
    setResizingColumn,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
