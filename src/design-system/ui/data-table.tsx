import {
  type ColumnDef,
  type ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table';
import { ChevronDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, GripVertical, Settings2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({ columns, data, searchPlaceholder = 'Filter...' }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const allColumns = table.getAllColumns().filter((col) => col.getCanHide());

  const orderedColumns = useMemo(() => {
    if (columnOrder.length === 0) return allColumns;
    return [...allColumns].sort((a, b) => {
      const aIdx = columnOrder.indexOf(a.id);
      const bIdx = columnOrder.indexOf(b.id);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }, [allColumns, columnOrder]);

  const moveColumn = useCallback(
    (columnId: string, direction: 'up' | 'down') => {
      const currentOrder = columnOrder.length > 0 ? [...columnOrder] : allColumns.map((c) => c.id);
      const idx = currentOrder.indexOf(columnId);
      if (idx === -1) return;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= currentOrder.length) return;
      [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
      setColumnOrder(currentOrder);
    },
    [columnOrder, allColumns]
  );

  // --- Drag state ---
  const [draggedCol, setDraggedCol] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    setDraggedCol(columnId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();
      if (!draggedCol || draggedCol === targetColumnId) {
        setDraggedCol(null);
        return;
      }
      const currentOrder = columnOrder.length > 0 ? [...columnOrder] : allColumns.map((c) => c.id);
      const fromIdx = currentOrder.indexOf(draggedCol);
      const toIdx = currentOrder.indexOf(targetColumnId);
      if (fromIdx === -1 || toIdx === -1) {
        setDraggedCol(null);
        return;
      }
      currentOrder.splice(fromIdx, 1);
      currentOrder.splice(toIdx, 0, draggedCol);
      setColumnOrder(currentOrder);
      setDraggedCol(null);
    },
    [draggedCol, columnOrder, allColumns]
  );

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <input
          type='text'
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        />

        <Popover>
          <PopoverTrigger render={<Button variant='outline' size='sm' className='ml-auto' />}>
            <Settings2 className='mr-2 h-4 w-4' />
            Columns
            <ChevronDown className='ml-1 h-3 w-3' />
          </PopoverTrigger>
          <PopoverContent align='end' className='w-64 p-0'>
            <div className='px-3 py-2 border-b'>
              <p className='text-sm font-medium'>Toggle & reorder columns</p>
              <p className='text-xs text-muted-foreground'>Drag to reorder, click to toggle</p>
            </div>
            <div className='p-1 max-h-72 overflow-y-auto'>
              {orderedColumns.map((column, idx) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors select-none',
                    draggedCol === column.id && 'opacity-50'
                  )}
                >
                  <GripVertical className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    aria-label={`Toggle ${column.id}`}
                  />
                  <span className='capitalize truncate'>{column.id}</span>
                  <div className='ml-auto flex gap-0.5 shrink-0'>
                    <button
                      type='button'
                      onClick={() => moveColumn(column.id, 'up')}
                      disabled={idx === 0}
                      className='p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed'
                      aria-label={`Move ${column.id} up`}
                    >
                      <svg className='h-3 w-3' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M6 2L6 10M6 2L2 6M6 2L10 6' />
                      </svg>
                    </button>
                    <button
                      type='button'
                      onClick={() => moveColumn(column.id, 'down')}
                      disabled={idx === orderedColumns.length - 1}
                      className='p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed'
                      aria-label={`Move ${column.id} down`}
                    >
                      <svg className='h-3 w-3' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M6 10L6 2M6 10L2 6M6 10L10 6' />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronFirst className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <ChevronLast className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
