import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Task } from '../../types';
import { formatDate, getStatusColor, getPriorityColor } from '../../lib/utils';

interface TaskTableProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskStatusChange: (taskId: number, status: Task['status']) => void;
  onTaskCompleteToggle?: (taskId: number) => Promise<void>;
}

export default function TaskTable({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange
}: TaskTableProps) {
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Task Name
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <div className="font-medium text-foreground">{row.getValue('name')}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const getStatusIcon = (status: string) => {
            switch (status) {
              case 'todo':
                return <Circle className="h-4 w-4 text-gray-500" />;
              case 'in_progress':
                return <Clock className="h-4 w-4 text-blue-500" />;
              case 'review':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
              case 'completed':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
              case 'cancelled':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
              default:
                return <Circle className="h-4 w-4 text-gray-500" />;
            }
          };

          return (
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}
              </span>
            </div>
          );
        },
        filterFn: 'equals',
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = row.getValue('priority') as string;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
              {priority}
            </span>
          );
        },
        filterFn: 'equals',
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const progress = row.getValue('progress') as number;
          const status = row.original.status;
          const isCompleted = status === 'completed';

          return (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-primary'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-12 ${isCompleted ? 'text-green-600' : 'text-foreground'
                }`}>
                {progress}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        cell: ({ row }) => {
          const dueDate = row.getValue('due_date') as string;
          if (!dueDate) return <span className="text-muted-foreground">No due date</span>;

          const isOverdue = new Date(dueDate) < new Date();
          return (
            <div className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-foreground'}`}>
              {formatDate(dueDate)}
              {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'estimated_hours',
        header: 'Est. Hours',
        cell: ({ row }) => {
          const hours = row.getValue('estimated_hours') as number;
          return hours ? `${hours}h` : '-';
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  console.log('TaskTable: Complete button clicked for task:', task.id, 'Current status:', task.status);
                  if (onTaskCompleteToggle) {
                    setCompletingTaskId(task.id);
                    try {
                      await onTaskCompleteToggle(task.id);
                    } finally {
                      setCompletingTaskId(null);
                    }
                  } else {
                    onTaskStatusChange(task.id, 'completed');
                  }
                }}
                disabled={completingTaskId === task.id}
                className={`h-8 w-8 p-0 ${task.status === 'completed'
                  ? 'text-green-500 hover:text-blue-500'
                  : 'text-blue-500 hover:text-green-500'
                  }`}
                title={task.status === 'completed' ? 'Click to reset to TODO' : 'Mark as completed'}
              >
                {completingTaskId === task.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskEdit(task)}
                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                title="Edit task"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskDelete(task.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onTaskEdit, onTaskDelete, onTaskStatusChange]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const getStatusFilterOptions = () => {
    const statuses = ['todo', 'in_progress', 'review', 'completed', 'cancelled'];
    return statuses.map(status => ({
      value: status,
      label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
  };

  const getPriorityFilterOptions = () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
    }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Global Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              table.getColumn('status')?.setFilterValue(value || undefined);
            }}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Statuses</option>
            {getStatusFilterOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={(table.getColumn('priority')?.getFilterValue() as string) ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              table.getColumn('priority')?.setFilterValue(value || undefined);
            }}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Priorities</option>
            {getPriorityFilterOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <span>|</span>
          <span>
            {table.getFilteredRowModel().rows.length} of {tasks.length} tasks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
