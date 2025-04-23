"use client"

import { useEffect, useState } from "react"
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
import { ArrowUpDown, ChevronDown, CirclePlus, Eye, EyeOff, FileText, Loader2, MoreHorizontal, Search, Upload, X } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { FileWithUrl, Metadata, User } from "@/app/_lib/types"
import Link from "next/link"
import { format } from "date-fns"
import { createUser, deleteUser, updateUser } from "@/app/_actions/user"
import { useToast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { createUserSchema, CreateUserSchema } from "@/app/_lib/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import MultiSelect from "@/components/multiSelect"
import { createClient } from "@supabase/supabase-js"
import { supabaseServiceRoleKey, supabaseUrl } from "@/app/_lib/config"
import { uploadFile } from "../reportButton"
import { createExpert } from "@/app/_actions/expert"
import EnhancedSlider from "@/components/ui/enhancedSlider"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);


export function UserManagement({users, meta}: { users: User[], meta: Metadata }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<FileWithUrl | null>(null)

  const {toast} = useToast()

  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues:{
      username:"",
      email:"",
      password:"",
      role:"admin"
    }
  })

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image_url} alt="Avatar" />
            <AvatarFallback>{row.getValue<string>("username").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>{row.getValue("username")}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "admin" ? "default" : role === "creator" ? "outline" : "secondary"}>{role}</Badge>
        )
      },
    },
    {
      accessorKey: "projects_created",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Projects Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("projects_created")}</div>,
    },
    {
      accessorKey: "projects_backed",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Projects Backed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("projects_backed")}</div>,
    },
    {
      accessorKey: "total_contributed",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Total Contributed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("total_contributed"))
        return <div className="font-medium">{amount.toLocaleString()}DA</div>
      },
    },
    {
      accessorKey: "activated",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("activated") ? "Active" : "Inactive"
        return (
          <Badge variant={row.getValue("activated") ? "outline" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setEditedUser({ ...user })
                  setIsEditDialogOpen(true)
                }}
              >
                Edit user
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {  
                  e.stopPropagation()
                  setSelectedUser(user)
                  setIsDeleteDialogOpen(true)
                }}
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  async function onSubmit(values: CreateUserSchema) {
    if(values.role === "expert"){
      const result = await createExpert(values)
      if(result.status) {
        toast({
          title: TOAST_SUCCESS_TITLE,
          description: "Expert create successfully",
          variant: "default",
        });
        
      } else {
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant: "destructive",
        });
      }
    }else{
      const result = await createUser(values)
      if(result.status) {
        toast({
          title: TOAST_SUCCESS_TITLE,
          description: "User create successfully",
          variant: "default",
        });
        
      } else {
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant: "destructive",
        });
      }
    }
    form.reset()
    setIsAddDialogOpen(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]

    // Check if file exceeds 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: "File must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create new file entry with uploading status
    setUploadedFile({
      file,
      url: null,
      isUploading: true
    });

    // Reset the input value to allow selecting the same file again
    e.target.value = ""

    try {
      const url = await uploadFile(file);
      
      if (!url) {
        setUploadedFile(null)
        return
      }
      
      // Update the file entry with the URL and set uploading to false
      setUploadedFile({
        file,
        url,
        isUploading: false
      });
      
      // Set the URL in the form
      form.setValue("qualification", url);
      
      console.log("File uploaded successfully:", url);
    } catch (error) {
      // Update the file entry to show upload failed
      setUploadedFile(null);
      
      console.error("Error uploading file:", error);
      toast({
        title: "File upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  const removeFile = async() => {
    if (uploadedFile) {
      const {data, error} = await supabase.storage
        .from('fileUploads')
        .remove([`files/${uploadedFile.file.name}`]);
        
      if (error) {
        toast({
          title: TOAST_ERROR_TITLE,
          description: "Error happened while deleting the file",
          variant: "destructive"
        })
      }
    }

    setUploadedFile(null);
    form.setValue("qualification", undefined);
  }


  return (
    <div className="container mx-auto px-5 py-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={
                  (table.getColumn("username")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("username")
                    ?.setFilterValue(event.target.value)
                }
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
            <Button
              onClick={() => {
                setIsAddDialogOpen(true);
              }}
              className="bg-accentColor hover:bg-secondaryColor text-white"
            >
              <CirclePlus />
              <span className="text-xs">Add User</span>
            </Button>
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
                href={`/admin/dashboard/users?page=${meta.current_page - 1}`}
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
                href={`/admin/dashboard/users?page=${meta.current_page + 1}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected user.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.image_url} alt="Avatar" />
                      <AvatarFallback>
                        {selectedUser.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedUser.username}</CardTitle>
                      <CardDescription>
                        Joined on{" "}
                        {format(
                          selectedUser.created_at,
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p>{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Role
                        </p>
                        <Badge
                          variant={
                            selectedUser.role === "admin"
                              ? "default"
                              : selectedUser.role === "creator"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {selectedUser.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Status
                        </p>
                        <Badge
                          variant={
                            selectedUser.activated ? "outline" : "destructive"
                          }
                        >
                          {selectedUser.activated ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Projects Created
                        </p>
                        <p>{selectedUser.projects_created}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Projects Backed
                        </p>
                        <p>{selectedUser.projects_backed}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Contributed
                        </p>
                        <p>
                          ${selectedUser.total_contributed.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-row-reverse justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewDialogOpen(false)}
                    >
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {editedUser && (
              <form
                id="edit-user-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const result = await updateUser(
                    editedUser,
                    editedUser.user_id as string
                  );
                  if (result.status) {
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "Project updated successfully",
                      variant: "default",
                    });
                  } else {
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: result.error,
                      variant: "destructive",
                    });
                  }
                  setIsEditDialogOpen(false);
                }}
                className="grid gap-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-semibold">
                      Role:
                    </Label>
                    <Select
                      defaultValue={editedUser.role}
                      onValueChange={(value) =>
                        setEditedUser({ ...editedUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold">
                      Status:
                    </Label>
                    <Select
                      defaultValue={
                        editedUser.activated ? "active" : "inactive"
                      }
                      onValueChange={(value) =>
                        setEditedUser({
                          ...editedUser,
                          activated: value === "active" ? true : false,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-accentColor hover:bg-secondaryColor text-white"
                form="edit-user-form"
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
                Are you sure you want to delete this user? This action cannot be
                undone.
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
                  const result = await deleteUser(
                    selectedUser?.user_id as string
                  );
                  if (result.status) {
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "User deleted successfully",
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[800px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Create a new user. Click create when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                id="create-user-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Username:</FormLabel>
                      <FormControl>
                        <Input placeholder="example user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email:</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Password:</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`absolute top-1/2 -translate-y-1/2 h-fit p-0 hover:bg-transparent right-5`}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Role:</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("role") === "expert" && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-semibold">Fields:</Label>
                      <MultiSelect
                        register={form.register}
                        control={form.control}
                        errors={form.formState.errors}
                        name="expertise_fields"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Qualification:
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  className="hidden"
                                  id="file-upload"
                                  onChange={handleFileChange}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById("file-upload")
                                      ?.click()
                                  }
                                  disabled={
                                    !!uploadedFile && !uploadedFile.isUploading
                                  }
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploadedFile
                                    ? "Replace File"
                                    : "Upload File"}
                                </Button>
                              </div>

                              {uploadedFile && (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="truncate max-w-[200px]">
                                      {uploadedFile.file.name}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      (
                                      {(uploadedFile.file.size / 1024).toFixed(
                                        0
                                      )}{" "}
                                      KB)
                                    </span>
                                    {uploadedFile.isUploading && (
                                      <Loader2 className="h-3 w-3 animate-spin text-gray-500 ml-1" />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                    onClick={removeFile}
                                    disabled={uploadedFile.isUploading}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove file</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a file (max 5MB)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expertise_level"
                      render={({field: {value, onChange}})=>(
                        <FormItem>
                          <FormLabel>Expertise level:</FormLabel>
                          <FormControl>
                            <EnhancedSlider defaultValue={[value as number]} onValueChange={(value) => onChange(value[0])}/>
                          </FormControl>
                          <FormDescription>
                            Select the expert's expertise level, 0% to 100%. For an expert with multiple disciplines, put the average value.
                          </FormDescription>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Is Available:</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </form>
            </Form>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-accentColor hover:bg-secondaryColor text-white"
                form="create-user-form"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>Create</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

