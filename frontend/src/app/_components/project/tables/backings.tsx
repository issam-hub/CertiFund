"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Backing, Metadata } from "@/app/_lib/types"
import { formatDateTime, formatDateTimeSecond } from "@/app/_lib/utils"
import Link from "next/link"
import { deleteBacking, updateBacking } from "@/app/_actions/projects"
import { useToast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BackingManagement({backings, meta}:{backings:Backing[], meta: Metadata}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedBacking, setSelectedBacking] = useState<Backing | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")

  const {toast} = useToast()

  const columns: ColumnDef<Backing>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "backing_id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("backing_id")}</div>,
    },
    {
      accessorKey: "backer",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Backer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("backer")}</div>,
    },
    {
      accessorKey: "project",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Project
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("project")}</div>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        return <div className="font-medium">{amount.toLocaleString()}DA</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={"outline"} className={`${status === "succeeded" ? "text-green-500 border-green-500" : "text-red-500 border-red-500"}`}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => <div>{formatDateTimeSecond(row.getValue("created_at"))}</div>,
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => <div>{row.getValue("payment_method")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const backing = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild onClick={(e)=>e.stopPropagation()}>
                <Link href={`/projects/discover/${row.original.project_id}`}>
                  Access Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBacking(backing)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit backing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBacking(backing)
                  setIsDeleteDialogOpen(true)
                }}
              >
                Delete backing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: backings || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      globalSearch: (row, columnId, filterValue) => {
        const backer = String(row.getValue("backer")).toLowerCase()
        const project = String(row.getValue("project")).toLowerCase()
        const searchTerm = String(filterValue).toLowerCase()
        
        return backer.includes(searchTerm) || project.includes(searchTerm)
      }
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  })

  const handleRowClick = (backing: Backing) => {
    setSelectedBacking(backing)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Backing Management</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search backings..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
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
                    onClick={() => handleRowClick(row.original)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="space-x-2">
            <Button variant={"outline"} size={"sm"} asChild>
              <Link
                  className={`${
                      meta.current_page <= 1 &&
                      "pointer-events-none bg-slate-50 text-slate-400"
                  }`}
                  href={`/admin/dashboard/backings?page=${meta.current_page - 1}`}
              >
                  Previous
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                className={`${
                  meta.current_page === meta.last_page &&
                  "pointer-events-none bg-slate-50 text-slate-400"
                }`}
                href={`/admin/dashboard/backings?page=${meta.current_page + 1}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>

        {/* View Backing Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Backing Details</DialogTitle>
              <DialogDescription>Detailed information about the selected backing.</DialogDescription>
            </DialogHeader>
            {selectedBacking && (
              <div className="grid gap-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Backing #{selectedBacking.backing_id}</CardTitle>
                    <CardDescription>Made on {formatDateTimeSecond(selectedBacking.created_at)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Backer</p>
                        <p>{selectedBacking.backer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Project</p>
                        <p>{selectedBacking.project}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                        <p>{selectedBacking.amount.toLocaleString()}DA</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant="outline">
                          {selectedBacking.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                        <p>{selectedBacking.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                        <p>{selectedBacking.transaction_id}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-row-reverse justify-between">
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                      Close
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

              {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Backing</DialogTitle>
              <DialogDescription>Update backing information. Click save when you're done.</DialogDescription>
            </DialogHeader>
              <form id="edit-backing-form" onSubmit={async(e)=>{
                const formData = new FormData(e.currentTarget)
                const result = await updateBacking(formData.get("status") as string, Number(selectedBacking?.payment_id))
                if(result.status){
                  toast({
                    title: TOAST_SUCCESS_TITLE,
                    description: "Backing updated successfully"
                  })
                }else{
                  toast({
                    title: TOAST_ERROR_TITLE,
                    description: result.error,
                    variant:"destructive"
                  })
                }
                setIsEditDialogOpen(false)
              }} className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold">Status:</Label>
                    <Select name="status" defaultValue={selectedBacking?.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="succeeded">Succeeded</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-accentColor hover:bg-secondaryColor text-white"
                form="edit-backing-form"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this backing? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async() => {
                  // Handle deletion logic here
                  const result = await deleteBacking(Number(selectedBacking?.backing_id))
                  if(result.status){
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "Backing deleted successfully",
                      variant: "default",
                    })
                  }else{
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: result.error,
                      variant: "destructive",
                    })
                  }
                  setIsDeleteDialogOpen(false)
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

