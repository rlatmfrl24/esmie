"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Prompt } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Copy, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PromptTableProps {
  data: Prompt[];
}

export function PromptTable({ data }: PromptTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleCopy = async (text: string, id: string) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setIsCopied(id);
      setTimeout(() => setIsCopied(null), 2000);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", deleteId);

      if (error) {
        console.error("Error deleting prompt:", error);
        alert(`Failed to delete prompt: ${error.message}`);
        return;
      }

      setDeleteId(null);
      setRowSelection({});
      router.refresh();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMerge = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    const idsParam = selectedIds.join(",");
    router.push(`/merge?ids=${idsParam}`);
  };

  const columns: ColumnDef<Prompt>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "version",
      header: () => <div className="">Ver.</div>,
      cell: ({ row }) => (
        <div className="w-[40px]">
          <Badge variant="outline" className="font-mono text-[10px]">
            v{row.getValue("version")}
          </Badge>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "core_theme",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Theme
          {column.getIsSorted() === "asc" ? (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          ) : null}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[400px] truncate font-medium">
              <Link
                href={`/prompt/${row.original.id}`}
                className="hover:underline decoration-primary underline-offset-4"
              >
                {row.getValue("core_theme") || "Untitled"}
              </Link>
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "final_prompt",
      header: "Prompt",
      cell: ({ row }) => {
        const prompt = row.getValue("final_prompt") as string;
        const id = row.original.id;

        return (
          <div className="flex items-center gap-2 max-w-[700px]">
            <span className="truncate text-muted-foreground">{prompt}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(prompt, id);
              }}
            >
              {isCopied === id ? (
                <span className="text-green-500 text-xs font-bold">✓</span>
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          {column.getIsSorted() === "asc" ? (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          ) : null}
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        if (!date) return "-";
        return (
          <div className="text-muted-foreground text-sm">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const prompt = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => setDeleteId(prompt.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
                <span className="ml-auto text-xs tracking-widest opacity-60">
                  ⌘⌫
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your prompts!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2">
            {Object.keys(rowSelection).length > 0 && (
              <Button
                onClick={handleMerge}
                variant="outline"
                className="gap-2 animate-in fade-in slide-in-from-right-5"
              >
                <Layers className="w-4 h-4" />
                Merge ({Object.keys(rowSelection).length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
      </div>

      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
