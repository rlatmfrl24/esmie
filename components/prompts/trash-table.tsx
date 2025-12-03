"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { TrashItem } from "@/lib/types";
import {
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
import { MoreHorizontal, ArrowUpDown, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stripTrashMetadata = <T extends Record<string, unknown>>(item: T) => {
  const clone = { ...item } as Record<string, unknown>;
  delete clone.id;
  delete clone.deleted_at;
  delete clone.is_favorite;
  delete clone.prompt_id;
  delete clone.favorite_id;
  delete clone.favorite_status;
  delete clone.favorite_snapshot_created_at;
  return clone as Omit<
    T,
    | "id"
    | "deleted_at"
    | "is_favorite"
    | "prompt_id"
    | "favorite_id"
    | "favorite_status"
    | "favorite_snapshot_created_at"
  >;
};

interface TrashTableProps {
  data: TrashItem[];
}

export function TrashTable({ data }: TrashTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"restore" | "delete" | null>(
    null
  );
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<
    "restore" | "delete" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleAction = async () => {
    if (!actionId || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "restore") {
        // 1. Fetch from trash
        const { data: trashItem, error: fetchError } = await supabase
          .from("trash")
          .select("*")
          .eq("id", actionId)
          .single();

        if (fetchError || !trashItem) {
          throw new Error(`Failed to fetch from trash: ${fetchError?.message}`);
        }

        // 2. Insert back into appropriate table based on origin_type
        // Note: trash table has bigint id, but target tables use UUID id
        // Exclude trash-specific fields and id (target tables will auto-generate UUID id)
        const { origin_type, item_uid, ...trashRest } = trashItem;
        const promptData = stripTrashMetadata(trashRest);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        if (origin_type === "FAVORITE") {
          // Restore to favorite_prompts
          // Exclude id (favorite_prompts will auto-generate UUID id)
          const { error: insertError } = await supabase
            .from("favorite_prompts")
            .insert([
              {
                ...promptData,
                user_id: user.id,
                item_uid: null,
              },
            ]);

          if (insertError) {
            throw new Error(
              `Failed to restore favorite: ${insertError.message}`
            );
          }
        } else {
          // Restore to prompts (default for PROMPT or undefined)
          // Only include id if item_uid exists, otherwise let database auto-generate UUID
          const restoredPrompt = item_uid
            ? { ...promptData, id: item_uid }
            : promptData;
          const { error: insertError } = await supabase
            .from("prompts")
            .insert([restoredPrompt]);

          if (insertError) {
            throw new Error(`Failed to restore prompt: ${insertError.message}`);
          }
        }

        // 3. Delete from trash
        const { error: deleteError } = await supabase
          .from("trash")
          .delete()
          .eq("id", actionId);

        if (deleteError) {
          throw new Error(
            `Failed to remove from trash: ${deleteError.message}`
          );
        }
      } else {
        // Delete permanently
        const { error } = await supabase
          .from("trash")
          .delete()
          .eq("id", actionId);

        if (error) {
          throw new Error(`Failed to delete permanently: ${error.message}`);
        }
      }

      setActionId(null);
      setActionType(null);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error(`Error ${actionType}ing prompt:`, error);
      alert(`Failed to ${actionType} prompt: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0 || !bulkActionType) return;

    setIsProcessing(true);
    try {
      if (bulkActionType === "restore") {
        // 1. Fetch from trash
        const { data: trashItems, error: fetchError } = await supabase
          .from("trash")
          .select("*")
          .in("id", selectedIds);

        if (fetchError)
          throw new Error(`Failed to fetch from trash: ${fetchError.message}`);

        // 2. Insert back into appropriate tables based on origin_type
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const promptsToRestore: Record<string, unknown>[] = [];
        const favoritesToRestore: Record<string, unknown>[] = [];

        trashItems.forEach((item) => {
          const { origin_type, item_uid, ...trashRest } = item;
          const rest = stripTrashMetadata(trashRest);

          if (origin_type === "FAVORITE") {
            // Exclude id (favorite_prompts will auto-generate UUID id)
            favoritesToRestore.push({
              ...rest,
              user_id: user.id,
              item_uid: null,
            });
          } else {
            // Only include id if item_uid exists, otherwise let database auto-generate UUID
            const restoredPrompt = item_uid ? { ...rest, id: item_uid } : rest;
            promptsToRestore.push(restoredPrompt);
          }
        });

        if (promptsToRestore.length > 0) {
          const { error: insertError } = await supabase
            .from("prompts")
            .insert(promptsToRestore);

          if (insertError)
            throw new Error(
              `Failed to restore prompts: ${insertError.message}`
            );
        }

        if (favoritesToRestore.length > 0) {
          const { error: insertError } = await supabase
            .from("favorite_prompts")
            .insert(favoritesToRestore);

          if (insertError)
            throw new Error(
              `Failed to restore favorites: ${insertError.message}`
            );
        }

        // 3. Delete from trash
        const { error: deleteError } = await supabase
          .from("trash")
          .delete()
          .in("id", selectedIds);

        if (deleteError)
          throw new Error(
            `Failed to remove from trash: ${deleteError.message}`
          );

        toast.success(`${selectedIds.length} prompts restored successfully`);
      } else {
        // Delete permanently
        const { error } = await supabase
          .from("trash")
          .delete()
          .in("id", selectedIds);

        if (error)
          throw new Error(`Failed to delete permanently: ${error.message}`);

        toast.success(`${selectedIds.length} prompts deleted permanently`);
      }

      setRowSelection({});
      setShowBulkActionDialog(false);
      setBulkActionType(null);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error(`Error ${bulkActionType}ing prompts:`, error);
      toast.error(`Failed to ${bulkActionType} prompts: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ColumnDef<TrashItem>[] = [
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
            <span className="max-w-[300px] truncate font-medium">
              {row.getValue("core_theme") || "Untitled"}
            </span>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "final_prompt",
      header: "Prompt",
      cell: ({ row }) => {
        const prompt = row.getValue("final_prompt") as string;
        return (
          <div className="flex items-center gap-2 max-w-[800px]">
            <span className="truncate text-muted-foreground">{prompt}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "origin_type",
      header: "Origin",
      cell: ({ row }) => {
        const originType = row.getValue("origin_type") as string;
        return (
          <Badge variant={originType === "FAVORITE" ? "secondary" : "outline"}>
            {originType || "PROMPT"}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "created_at", // Using created_at as proxy for deleted_at if not available, or just showing created date
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
                onClick={() => {
                  setActionId(prompt.id);
                  setActionType("restore");
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setActionId(prompt.id);
                  setActionType("delete");
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Forever
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
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="h-full flex-1 flex flex-col space-y-2 p-8 overflow-hidden">
      <div className="flex items-center justify-between space-y-2 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trash</h2>
          <p className="text-muted-foreground">Manage your deleted prompts.</p>
        </div>
        <div className="flex items-center space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <>
              <Button
                onClick={() => {
                  setBulkActionType("restore");
                  setShowBulkActionDialog(true);
                }}
                variant="outline"
                className="gap-2 animate-in fade-in slide-in-from-right-5"
              >
                <RotateCcw className="w-4 h-4" />
                Restore ({Object.keys(rowSelection).length})
              </Button>
              <Button
                onClick={() => {
                  setBulkActionType("delete");
                  setShowBulkActionDialog(true);
                }}
                variant="destructive"
                className="gap-2 animate-in fade-in slide-in-from-right-5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Forever ({Object.keys(rowSelection).length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-md border relative">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-b-g">
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
                  No trash items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <Dialog
        open={!!actionId}
        onOpenChange={(open) => {
          if (!open) {
            setActionId(null);
            setActionType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "restore" ? "Restore Prompt" : "Delete Forever"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "restore"
                ? "Are you sure you want to restore this prompt? It will be moved back to your main list."
                : "Are you sure you want to permanently delete this prompt? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionId(null);
                setActionType(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : actionType === "restore"
                ? "Restore"
                : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showBulkActionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowBulkActionDialog(false);
            setBulkActionType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === "restore"
                ? "Restore Prompts"
                : "Delete Forever"}
            </DialogTitle>
            <DialogDescription>
              {bulkActionType === "restore"
                ? `Are you sure you want to restore ${
                    Object.keys(rowSelection).length
                  } selected prompts? They will be moved back to your main list.`
                : `Are you sure you want to permanently delete ${
                    Object.keys(rowSelection).length
                  } selected prompts? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkActionDialog(false);
                setBulkActionType(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={bulkActionType === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : bulkActionType === "restore"
                ? "Restore All"
                : "Delete All Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
