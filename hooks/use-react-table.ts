import React from "react";

// Types
type ColumnType = "text" | "number" | "select" | "checkbox" | "date";
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[];
  width?: number;
}

interface Cell {
  id: string;
  value: any;
}

export interface Row {
  id: string;
  cells: { [columnId: string]: Cell };
}

interface UseReactTableProps {
  rows?: Row[];
  columns?: Column[];
}
export function useReactTable({
  rows: initialRows,
  columns: initialColumns,
}: UseReactTableProps) {
  const [rows, setRows] = React.useState<Row[]>(
    initialRows && initialRows?.length > 0
      ? initialRows
      : [
          {
            id: "1",
            cells: {
              "1": { id: "1-1", value: "Task 1" },
              "2": { id: "1-2", value: "In Progress" },
              "3": { id: "1-3", value: "High" },
              "4": { id: "1-4", value: false },
              "5": { id: "1-5", value: "" },
            },
          },
          {
            id: "2",
            cells: {
              "1": { id: "2-1", value: "Task 2" },
              "2": { id: "2-2", value: "Complete" },
              "3": { id: "2-3", value: "Medium" },
              "4": { id: "2-4", value: true },
              "5": { id: "2-5", value: "" },
            },
          },
        ]
  );

  const [columns, setColumns] = React.useState<Column[]>(
    initialColumns && initialColumns.length > 0
      ? initialColumns
      : [
          { id: "1", name: "Name", type: "text", width: 200 },
          {
            id: "2",
            name: "Status",
            type: "select",
            options: ["Not Started", "In Progress", "Complete"],
            width: 150,
          },
          {
            id: "3",
            name: "Priority",
            type: "select",
            options: ["Low", "Medium", "High"],
            width: 120,
          },
          { id: "4", name: "Done", type: "checkbox", width: 80 },
          { id: "5", name: "Due Date", type: "date", width: 150 },
        ]
  );

  // it holds a reference to the cell being edited
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // it holds a reference to the column being edited
  const [editingColumn, setEditingColumn] = React.useState<string | null>(null);

  const inputRef = React.useRef<null | HTMLInputElement>(null);

  const updateCellValue = (rowId: string, columnId: string, value: any) => {
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              cells: {
                ...row.cells,
                [columnId]: { ...row.cells[columnId], value },
              },
            }
          : row
      )
    );
  };

  const isCellEditing = (row: Row, column: Column) => {
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.columnId === column.id;
    return isEditing;
  };

  // Add Column/Row
  const getDefaultCellValue = (type: ColumnType) => {
    switch (type) {
      case "text":
        return "";
      case "number":
        return 0;
      case "checkbox":
        return false;
      case "select":
        return "";
      case "date":
        return "";
      default:
        return "";
    }
  };

  const addColumn = (type: ColumnType, insertIndex?: number) => {
    const newColumn: Column = {
      id: Date.now().toString(),
      name: "New Column",
      type,
      width: 150,
      options: type === "select" ? ["Option 1", "Option 2"] : undefined,
    };

    const newColumns = [...columns];
    if (insertIndex !== undefined) {
      newColumns.splice(insertIndex, 0, newColumn);
    } else {
      newColumns.push(newColumn);
    }
    setColumns(newColumns);

    setRows(
      rows.map((row) => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumn.id]: {
            id: `${row.id}-${newColumn.id}`,
            value: getDefaultCellValue(type),
          },
        },
      }))
    );
  };

  const addRow = (insertIndex?: number) => {
    const newRow: Row = {
      id: Date.now().toString(),
      cells: {},
    };

    columns.forEach((column) => {
      newRow.cells[column.id] = {
        id: `${newRow.id}-${column.id}`,
        value: getDefaultCellValue(column.type),
      };
    });

    const newRows = [...rows];
    if (insertIndex !== undefined) {
      newRows.splice(insertIndex, 0, newRow);
    } else {
      newRows.push(newRow);
    }
    setRows(newRows);
  };

  // Update/Delete/Resize Column
  const updateColumnName = (columnId: string, name: string) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, name } : col))
    );
  };
  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId));
    setRows(
      rows.map((row) => {
        const newCells = { ...row.cells };
        delete newCells[columnId];
        return { ...row, cells: newCells };
      })
    );
  };

  // Delete Row
  const deleteRow = (rowId: string) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  React.useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  return {
    // column
    columns,
    setColumns,
    updateColumnName,
    deleteColumn,
    editingColumn,
    setEditingColumn,
    addColumn,
    // row
    rows,
    setRows,
    addRow,
    deleteRow,
    //cell
    updateCellValue,
    editingCell,
    setEditingCell,
    isCellEditing,
    inputRef,
  };
}
