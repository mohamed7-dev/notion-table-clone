"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Trash2,
  Plus,
  MoreHorizontal,
  Type,
  Hash,
  CalendarIcon,
  CheckSquare,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ColumnType = "text" | "number" | "select" | "checkbox" | "date";

interface Column {
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

interface Row {
  id: string;
  cells: { [columnId: string]: Cell };
}

interface NotionTableProps {
  initialColumns?: Column[];
  initialRows?: Row[];
}

const columnTypeIcons = {
  text: Type,
  number: Hash,
  select: Tag,
  checkbox: CheckSquare,
  date: CalendarIcon,
};

export function NotionTable({
  initialColumns = [],
  initialRows = [],
}: NotionTableProps) {
  const [columns, setColumns] = useState<Column[]>(
    initialColumns.length > 0
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

  const [rows, setRows] = useState<Row[]>(
    initialRows.length > 0
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

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizingColumn]);

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
            value: getDefaultValue(type),
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
        value: getDefaultValue(column.type),
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

  const deleteRow = (rowId: string) => {
    setRows(rows.filter((row) => row.id !== rowId));
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

  const getDefaultValue = (type: ColumnType) => {
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

  const updateColumnName = (columnId: string, name: string) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, name } : col))
    );
  };

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

      setColumns(
        columns.map((col) =>
          col.id === resizingColumn.columnId ? { ...col, width: newWidth } : col
        )
      );
    }
  };

  const handleMouseUp = () => {
    setResizingColumn(null);
  };

  const renderCell = (row: Row, column: Column) => {
    const cell = row.cells[column.id];
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.columnId === column.id;

    if (isEditing) {
      switch (column.type) {
        case "text":
          return (
            <Input
              ref={inputRef}
              value={cell?.value || ""}
              onChange={(e) =>
                updateCellValue(row.id, column.id, e.target.value)
              }
              onBlur={() => setEditingCell(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setEditingCell(null);
                }
              }}
              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-2 focus-visible:ring-accent"
            />
          );
        case "number":
          return (
            <Input
              ref={inputRef}
              type="number"
              value={cell?.value || 0}
              onChange={(e) =>
                updateCellValue(row.id, column.id, Number(e.target.value))
              }
              onBlur={() => setEditingCell(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setEditingCell(null);
                }
              }}
              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-2 focus-visible:ring-accent"
            />
          );
        case "select":
          return (
            <Select
              value={cell?.value || ""}
              onValueChange={(value) => {
                updateCellValue(row.id, column.id, value);
                setEditingCell(null);
              }}
            >
              <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-2 focus:ring-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case "date":
          return (
            <Popover
              open={true}
              onOpenChange={(open) => {
                if (!open) setEditingCell(null);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="border-0 bg-transparent p-0 h-auto justify-start font-normal focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {cell?.value
                    ? format(new Date(cell.value), "MMM dd, yyyy")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={cell?.value ? new Date(cell.value) : undefined}
                  onSelect={(date) => {
                    updateCellValue(
                      row.id,
                      column.id,
                      date ? date.toISOString() : ""
                    );
                    setEditingCell(null);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        default:
          return null;
      }
    }

    switch (column.type) {
      case "checkbox":
        return (
          <Checkbox
            checked={cell?.value || false}
            onCheckedChange={(checked) =>
              updateCellValue(row.id, column.id, checked)
            }
            className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />
        );
      case "select":
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              cell?.value === "Complete"
                ? "bg-green-100 text-green-800"
                : cell?.value === "In Progress"
                ? "bg-blue-100 text-blue-800"
                : cell?.value === "Not Started"
                ? "bg-gray-100 text-gray-800"
                : cell?.value === "High"
                ? "bg-red-100 text-red-800"
                : cell?.value === "Medium"
                ? "bg-yellow-100 text-yellow-800"
                : cell?.value === "Low"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {cell?.value || ""}
          </span>
        );
      case "date":
        return (
          <div className="flex items-center gap-2 text-foreground">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>
              {cell?.value ? format(new Date(cell.value), "MMM dd, yyyy") : ""}
            </span>
          </div>
        );
      default:
        return <span className="text-foreground">{cell?.value || ""}</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Project Tasks
        </h1>
        <p className="text-muted-foreground">
          Manage your project tasks with this Notion-like table
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                {columns.map((column, columnIndex) => {
                  const IconComponent = columnTypeIcons[column.type];
                  return (
                    <th
                      key={column.id}
                      className="text-left p-3 font-medium text-foreground group relative"
                      style={{ width: column.width || 150, minWidth: 80 }}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        {editingColumn === column.id ? (
                          <Input
                            value={column.name}
                            onChange={(e) =>
                              updateColumnName(column.id, e.target.value)
                            }
                            onBlur={() => setEditingColumn(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setEditingColumn(null);
                              }
                            }}
                            className="border-0 bg-transparent p-0 h-auto font-medium focus-visible:ring-2 focus-visible:ring-accent"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-accent transition-colors"
                            onClick={() => setEditingColumn(column.id)}
                          >
                            {column.name}
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => addColumn("text", columnIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Insert Column Before
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => addColumn("text", columnIndex + 1)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Insert Column After
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteColumn(column.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => handleMouseDown(e, column.id)}
                      />
                    </th>
                  );
                })}
                <th className="w-12 p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => addColumn("text")}>
                        <Type className="w-4 h-4 mr-2" />
                        Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addColumn("number")}>
                        <Hash className="w-4 h-4 mr-2" />
                        Number
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addColumn("select")}>
                        <Tag className="w-4 h-4 mr-2" />
                        Select
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addColumn("checkbox")}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Checkbox
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addColumn("date")}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Date
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`border-b border-border hover:bg-card/50 transition-colors group ${
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="p-3 cursor-pointer hover:bg-card transition-colors"
                      onClick={() => {
                        if (column.type !== "checkbox") {
                          setEditingCell({
                            rowId: row.id,
                            columnId: column.id,
                          });
                        }
                      }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="p-3 w-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => addRow(rowIndex)}>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Insert Row Above
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addRow(rowIndex + 1)}>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Insert Row Below
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteRow(row.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Row
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            onClick={() => addRow()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>
    </div>
  );
}
