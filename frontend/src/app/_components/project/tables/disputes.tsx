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
import { ArrowUpDown, ChevronDown, File, Loader2, MoreHorizontal, Search } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dispute, DisputeStatus, Metadata } from "@/app/_lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { deleteComment, deleteDispute, deleteProject, updateDispute } from "@/app/_actions/projects"
import { extractFilenameFromSupabaseUrl } from "@/app/_lib/utils"
import { createClient } from "@supabase/supabase-js"
import { supabaseServiceRoleKey, supabaseUrl } from "@/app/_lib/config"
import { ReportFormSchema, resolveFormSchema, ResolveFormSchema } from "@/app/_lib/schemas/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import CustomCheckBox from "@/components/customCheckbox"
import { deleteUser } from "@/app/_actions/user"

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: DisputeStatus) => {
  switch (status) {
    case "pending":
      return "outline"
    case "under review":
      return "warning"
    case "resolved":
      return "approved"
    case "rejected":
      return "rejected"
    case "cancelled":
      return "rejected"
    default:
      return "default"
  }
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);


export function DisputeManagement({disputes, meta}:{disputes:Dispute[], meta:Metadata}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [globalFilter, setGlobalFilter] = useState("")
  const [resolution, setResolution] = useState<{
    status: DisputeStatus | string
    notes: string
  }>({
    status: "",
    notes: "",
  })

  const {toast} = useToast()

    const form = useForm<ResolveFormSchema>({
      resolver: zodResolver(resolveFormSchema),
      defaultValues: {
        status: undefined,
        note: "",
        selectedActions:[]
      },
    })

  const columns: ColumnDef<Dispute>[] = [
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
      accessorKey: "dispute_id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("dispute_id")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return <div>{type}</div>
      },
    },
    {
      accessorKey: "reporter",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Reporter
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>{row.getValue("reporter")}</div>
        </div>
      ),
    },
    {
      accessorKey: "context",
      header: "Context",
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("context")}</div>,
    },
    {
      accessorKey: "reported_resource",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Reported Resource
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>{row.getValue("reported_resource")}</div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as DisputeStatus
        return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const dispute = row.original

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
              {(dispute.status === "pending" || dispute.status === "under review") && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDispute(dispute)
                    setIsResolveDialogOpen(true)
                  }}
                >
                  Resolve dispute
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDispute(dispute)
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
    data: disputes || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      globalSearch: (row, columnId, filterValue) => {
        const reporter = String(row.getValue("reporter")).toLowerCase()
        const reportedResource = String(row.getValue("reported_resource")).toLowerCase()
        const searchTerm = String(filterValue).toLowerCase()
        
        return reporter.includes(searchTerm) || reportedResource.includes(searchTerm)
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

    const handleRowClick = (dispute: Dispute) => {
      setSelectedDispute(dispute)
      setIsViewDialogOpen(true)
    }

      async function onSubmit(data: ResolveFormSchema) {
        if (data.selectedActions?.length) {
          for(const action of data.selectedActions){
            switch (action){
              case "delete-project":
                const result = await deleteProject(selectedDispute?.reported_resource_id as unknown as string);
                if (result.status) {
                  toast({
                    title: TOAST_SUCCESS_TITLE,
                    description:
                      "The project has been deleted successfully.",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: TOAST_ERROR_TITLE,
                    description: result.error,
                    variant: "destructive",
                  });
                }
                break;
              case "delete-user":
                const result2 = await deleteUser(selectedDispute?.reported_resource_id as unknown as string);
                if (result2.status) {
                  toast({
                    title: TOAST_SUCCESS_TITLE,
                    description: "User deleted successfully",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: TOAST_ERROR_TITLE,
                    description: result2.error,
                    variant: "destructive",
                  });
                }
                break;
              case "delete-comment":
                const result3 = await deleteComment(selectedDispute?.reported_resource_id as unknown as number);
                if (result3.status) {
                  toast({
                    title: TOAST_SUCCESS_TITLE,
                    description: "Comment deleted successfully",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: TOAST_ERROR_TITLE,
                    description: result3.error,
                    variant: "destructive",
                  });
                }
            }
          }
        }
    
        const result = await updateDispute(Number(selectedDispute?.dispute_id), data.status, data.note)
        if(result.status){
          toast({
            title: TOAST_SUCCESS_TITLE,
            description: "Dispute resolved successfully",
          })
        }else{
          toast({
            title: TOAST_ERROR_TITLE,
            description: result.error,
            variant:"destructive"
          })
        }
      
        form.reset()
        setIsResolveDialogOpen(false)
    
    }

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Dispute Management
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
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
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
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
                    onClick={() => handleRowClick(row.original)}
                    className="cursor-pointer hover:bg-muted/50"
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
          <div className="space-x-2">
            <Button variant={"outline"} size={"sm"} asChild>
              <Link
                className={`${
                  meta.current_page <= 1 &&
                  "pointer-events-none bg-slate-50 text-slate-400"
                }`}
                href={`/admin/dashboard/disputes?page=${meta.current_page - 1}`}
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
                href={`/admin/dashboard/disputes?page=${meta.current_page + 1}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>

        {/* View Dispute Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Dispute Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected dispute.
              </DialogDescription>
            </DialogHeader>
            {selectedDispute && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      #{selectedDispute.dispute_id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created on{" "}
                      {format(
                        new Date(selectedDispute.created_at),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(selectedDispute.status)}
                    className="text-sm py-1 px-3"
                  >
                    {selectedDispute.status}
                  </Badge>
                </div>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Dispute Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Reporter
                            </p>
                            <p>{selectedDispute.reporter}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Type
                            </p>
                            <p>{selectedDispute.type}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {selectedDispute.context === "project"
                              ? "Project Name"
                              : selectedDispute.context === "user"
                              ? "Username"
                              : "Comment Content"}
                          </p>
                          <p className="whitespace-pre-line">
                            {selectedDispute.reported_resource}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Description
                          </p>
                          <p className="whitespace-pre-line">
                            {selectedDispute.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedDispute.resolved_at &&
                      selectedDispute.resolved_at !==
                        "1970-01-01T00:00:00+01:00" && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Resolution
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Resolved On
                            </p>
                            <p>
                              {format(
                                new Date(selectedDispute.resolved_at),
                                "MMMM d, yyyy 'at' h:mm a"
                              )}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground mt-2">
                              Resolution Notes
                            </p>
                            <p className="text-sm">
                              {selectedDispute.status === "resolved"
                                ? "This dispute has been resolved in favor of the user. A refund has been processed."
                                : "This dispute has been rejected as it does not meet our criteria for intervention."}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Evidence Submitted</CardTitle>
                        <CardDescription>
                          Documents and information provided by the user
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedDispute.evidences ? (
                          <ul className="space-y-2">
                            {selectedDispute.evidences.map(
                              (evidence, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2 p-2 border rounded-md"
                                >
                                  <div className="h-10 w-10 bg-accent/10 rounded-md flex items-center justify-center">
                                    <File className="text-accentColor h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {extractFilenameFromSupabaseUrl(evidence)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Submitted with dispute
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={evidence} target="_blank">
                                      View
                                    </Link>
                                  </Button>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No evidence submitted for this dispute.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex flex-row-reverse">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Resolve Dispute Dialog */}
        <Dialog
          open={isResolveDialogOpen}
          onOpenChange={setIsResolveDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Update the status of this dispute and provide resolution notes.
              </DialogDescription>
            </DialogHeader>
            {selectedDispute && (
              <Form {...form}>
                <form id="resolve-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormItem>
                    <FormLabel htmlFor="status" className="font-semibold">
                      Resolution Status:
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={"resolved"}>
                                Resolved
                              </SelectItem>
                              <SelectItem value={"rejected"}>
                                Rejected
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Note:</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide details about your concern..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {
                    form.watch("status") === "resolved" && (
                      <CustomCheckBox control={form.control} type={selectedDispute.context}/>
                    )
                  }
                </form>
              </Form>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsResolveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                form="resolve-form"
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-accentColor hover:bg-secondaryColor"
              >
                {
                  form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ):(
                    "Submit Resolution"
                  )
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this dispute? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (
                    selectedDispute?.evidences &&
                    selectedDispute.evidences.length >= 0
                  ) {
                    const evidences = selectedDispute?.evidences?.map(
                      (evidence) => extractFilenameFromSupabaseUrl(evidence)
                    );
                    evidences?.forEach(async (evidence) => {
                      const { data, error } = await supabase.storage
                        .from("disputeevidences")
                        .remove([`evidences/${evidence}`]);
                      if (error) {
                        toast({
                          title: TOAST_ERROR_TITLE,
                          description: "Error happened while deleting the file",
                          variant: "destructive",
                        });
                      }
                    });
                  }
                  // Handle deletion logic here
                  const result = await deleteDispute(
                    Number(selectedDispute?.dispute_id)
                  );
                  if (result.status) {
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "Dispute deleted successfully",
                      variant: "default",
                    });
                  } else {
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: result.error,
                      variant: "destructive",
                    });
                  }
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
