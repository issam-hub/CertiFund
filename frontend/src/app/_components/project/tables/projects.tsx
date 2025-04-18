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
import { ArrowUpDown, Check, CheckCheck, ChevronDown, CircleDot, Loader2, MoreHorizontal, NotepadTextDashed, Radio, Search, Trash2, X } from "lucide-react"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Metadata, Project, ProjectStatus, Reward } from "@/app/_lib/types"
import Link from "next/link"
import Image from "next/image"
import { BLUR_IMAGE_URL, TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { deleteProject, getRewards, handleRewards, updateProject } from "@/app/_actions/projects"
import { toast, useToast } from "@/hooks/use-toast"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { reviewFormSchema, ReviewFormSchema } from "@/app/_lib/schemas/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { reviewProject } from "@/app/_actions/dashboard"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"


export function ProjectManagement({projects,meta}:{projects: Project[], meta: Metadata}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [rewards, setRewards] = useState<Reward[] |undefined>([])
  const {toast} = useToast()
  const user = useAtomValue(userAtom)

  useEffect(()=>{
    if(selectedProject){
      (async()=>{
        const result = await getRewards(selectedProject?.project_id as number)
        if(result.status){
          setRewards(result["rewards"])
        }else{
          toast({
            title: TOAST_ERROR_TITLE,
            description: result.error,
            variant: "destructive"
          })
          return
        }
      })()
    }
  },[selectedProject])

  const columns: ColumnDef<Project>[] = [
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
      accessorKey: "project_id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("project_id")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Project Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md overflow-hidden">
            <img
              src={row.original.project_img || "/placeholder.svg"}
              alt={row.getValue("title")}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="font-medium">{row.getValue("title")}</div>
        </div>
      ),
    },
    {
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => <div>{row.original.creator}</div>,
    },
    {
      accessorKey: "categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.getValue("categories") as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="outline" className="capitalize">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && <Badge variant="outline">+{categories.length - 2}</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "current_funding",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Funding
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number(row.getValue("current_funding"))/100
        const goal = Number(row.original.funding_goal)
        const percentage = Math.round((amount / goal) * 100)

        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{amount.toLocaleString()}DA</div>
          </div>
        )
      },
    },
    {
      accessorKey: "backers",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Backers
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("backers")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status.toLowerCase() as Partial<ProjectStatus>}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const deadline = new Date(row.getValue("deadline"))
        return <div>{format(deadline, "MMM d, yyyy")}</div>
      },
    },
    {
      accessorKey: "is_suspicious",
      header: "Is suspicious",
      cell: ({ row }) => {
        const isSus = row.getValue("is_suspicious")
        return <Badge className={`${isSus ? "border-orange-500 text-orange-500 hover:bg-orange-200" : "border-green-400 text-green-400 hover:bg-green-200"} bg-transparent`}>{isSus ? "True" : "False"}</Badge>
      },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const project = row.original
  
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
                <DropdownMenuItem asChild onClick={(e)=> e.stopPropagation()}
                >
                  <Link href={`/projects/discover/${project.project_id}`}>Access public page</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e)=>{
                    e.stopPropagation()
                    setSelectedProject(project)
                    setIsEditDialogOpen(true)
                  }}
                >
                  Review project
                </DropdownMenuItem>
                {
                  user?.role === "reviewer" && (
                  <DropdownMenuItem
                    onClick={(e)=>{
                      e.stopPropagation()
                      setSelectedProject(project)
                      setIsFlagDialogOpen(true)
                    }}
                  >
                    Flag project as suspicious
                  </DropdownMenuItem>
                  )
                }
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProject(project)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
  ]

  const table = useReactTable({
    data: projects || [],
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

  const handleRowClick = (project: Project) => {
    setSelectedProject(project)
    setIsViewDialogOpen(true)
  }

  const form = useForm<ReviewFormSchema>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      status: undefined,
      feedback: "",
    },
  })

  async function onSubmit(data: ReviewFormSchema){
    const reviewResult = await reviewProject(data, Number(selectedProject?.project_id))
    if (reviewResult.status){
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Project reviewed successfully",
      })
    }else{
      toast({
        title: TOAST_ERROR_TITLE,
        description: reviewResult.error,
        variant:"destructive"
      })
    }
    
    const result = await updateProject({status: data.status}, (selectedProject?.project_id)?.toString() as string)
    if(!result.status){
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant:"destructive"
      })
    }
    
    setIsEditDialogOpen(false)
  }

  

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Project Management
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={
                  (table.getColumn("title")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
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
            <Button variant="outline" size="sm" asChild>
              <Link
                className={`${
                  meta.current_page <= 1 &&
                  "pointer-events-none bg-slate-50 text-slate-400"
                }`}
                href={`/admin/dashboard/projects?page=${meta.current_page - 1}`}
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
                href={`/admin/dashboard/projects?page=${meta.current_page + 1}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>

        {/* Project Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto p-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {selectedProject && (
              <div className="flex flex-col">
                {/* Hero section with image overlay */}
                <div className="relative">
                  <div className="aspect-[21/9] w-full overflow-hidden">
                    <img
                      src={selectedProject.project_img || "/placeholder.svg"}
                      alt={selectedProject.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <Badge className="mb-2 w-fit">
                      {selectedProject.status}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {selectedProject.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-white/20">
                        <AvatarImage
                          src={selectedProject.creator_img}
                          alt={selectedProject.creator}
                        />
                        <AvatarFallback className="bg-accent text-white">
                          {selectedProject.creator[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white/80">
                        by {selectedProject.creator}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs navigation */}
                <Tabs
                  defaultValue="overview"
                  className="flex-1 mt-6 mx-2 md:w-[90%] md:mx-auto"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="campaign">Campaign</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent
                    value="overview"
                    className="p-6 space-y-5 focus:outline-none"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.categories.map((category) => (
                        <Badge
                          key={category}
                          className="capitalize bg-accentColor/10 text-accentColor hover:bg-accentColor/20 border-0"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-[14px] text-muted-foreground">
                      {selectedProject.description}
                    </p>

                    {/* Funding progress card */}
                    <div className="bg-gradient-to-br from-accentColor/5 to-secondary/5 rounded-xl p-6 border border-accentColor/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Funding Goal
                          </h3>
                          <p className="text-3xl font-bold">
                            {(
                              selectedProject.funding_goal / 100
                            ).toLocaleString()}
                            DA
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Current Funding
                          </h3>
                          <p className="text-3xl font-bold text-accentColor">
                            {(
                              selectedProject.current_funding / 100
                            ).toLocaleString()}
                            DA
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {Math.round(
                              (selectedProject.current_funding /
                                selectedProject.funding_goal) *
                                100
                            )}
                            % Funded
                          </span>
                          <span className="text-sm font-medium bg-accentColor/10 text-accentColor px-2 py-1 rounded-full">
                            {selectedProject.backers} backers
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accentColor to-accentColor/80 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (selectedProject.current_funding /
                                  selectedProject.funding_goal) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background/50 rounded-lg p-4 border border-slate-200">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Launched At
                          </h3>
                          <p className="text-lg font-medium">
                            {format(
                              new Date(selectedProject.launched_at),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 border border-slate-200">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Deadline
                          </h3>
                          <p className="text-lg font-medium">
                            {format(
                              new Date(selectedProject.deadline),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 border border-slate-200">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Created At
                          </h3>
                          <p className="text-lg font-medium">
                            {format(
                              new Date(selectedProject.created_at),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 border border-slate-200">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Created At
                          </h3>
                          <p className="text-lg font-medium">
                            {format(
                              new Date(selectedProject.updated_at),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Campaign Tab */}
                  <TabsContent
                    value="campaign"
                    className="p-6 focus:outline-none"
                  >
                    <div
                      className="prose max-w-none [&_h1]:mb-3 [&_h1]:text-2xl [&_h2]:mb-3 [&_h2]:text-lg [&_h3]:mb-3 [&_h3]:text-base [&_h4]:mb-3 [&_h4]:text-sm [&_h5]:mb-3 [&_h5]:text-xs [&_hr]:my-5 [&_p]:text-[13px] [&_img]:my-5"
                      dangerouslySetInnerHTML={{
                        __html: selectedProject.campaign,
                      }}
                    />
                  </TabsContent>

                  <TabsContent
                    value="rewards"
                    className="p-6 focus:outline-none"
                  >
                    <Carousel opts={{ align: "start" }}>
                      <div className="hidden md:flex">
                        <CarouselPrevious className="relative left-[calc(100%-100px)]" />
                        <CarouselNext className="relative -right-[calc(100%-80px)]" />
                      </div>
                      <CarouselContent className="flex">
                        {rewards?.map((reward, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-1/2 self-stretch relative"
                          >
                            <Card
                              key={index}
                              className={`transition-colors ease-out duration-200 border-2 border-gray-200 h-full`}
                            >
                              <CardContent className="p-4">
                                {reward.image_url && (
                                  <Image
                                    src={""}
                                    placeholder="blur"
                                    blurDataURL={BLUR_IMAGE_URL}
                                    overrideSrc={reward.image_url}
                                    alt="reward-img"
                                    width={100}
                                    height={100}
                                    className="w-full h-[250px] mb-1 object-cover rounded-t-md"
                                  />
                                )}
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium">
                                    {reward.title}
                                  </h5>
                                  <h4 className="font-bold text-lg">
                                    {reward.amount / 100}DA
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {reward.description}
                                </p>

                                {reward.includes && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium mb-1">
                                      Includes:
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {reward.includes.map((item, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-[#3B82F6]">
                                            •
                                          </span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="text-sm text-gray-600 mb-3">
                                  Estimated delivery:{" "}
                                  {new Date(
                                    reward.estimated_delivery
                                  ).getMonth()}
                                  /
                                  {new Date(
                                    reward.estimated_delivery
                                  ).getFullYear()}
                                </div>
                              </CardContent>
                            </Card>
                            <Button
                              onClick={async () => {
                                setRewards(
                                  rewards.filter(
                                    (reward2, index2) =>
                                      rewards[index2] !== rewards[index]
                                  )
                                );
                                const result = await handleRewards(
                                  { rewards: rewards },
                                  (selectedProject?.project_id).toString(),
                                  "update"
                                );
                                if (result.status) {
                                  toast({
                                    title: TOAST_SUCCESS_TITLE,
                                    description: "Reward deleted successfully",
                                    variant: "default",
                                  });
                                } else {
                                  toast({
                                    title: TOAST_ERROR_TITLE,
                                    description: result.error,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              variant="ghost"
                              className="p-2 absolute bottom-2 right-2 bg-white border border-slate-200"
                            >
                              <Trash2 className="text-red-500 h-7 w-7" />
                              <span className="sr-only">delete reward</span>
                            </Button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="p-6 border-t">
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Flagging</DialogTitle>
              <DialogDescription>
                Are you sure you want to flag this project as suspicious?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsFlagDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-400 hover:bg-orange-500 text-white"
                onClick={async () => {
                  const reviewResult = await reviewProject({status:"Flagged", feedback:""}, Number(selectedProject?.project_id))
                  if (!reviewResult.status){
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: reviewResult.error,
                      variant:"destructive"
                    })
                  }

                  const result = await updateProject(
                    { is_suspicious: true },
                    (selectedProject?.project_id)?.toString() as string
                  );
                  if (result.status) {
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "Project flagged successfully",
                      variant: "default",
                    });
                    setIsFlagDialogOpen(false)
                  } else {
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: result.error,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This action cannot
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
                  // Handle deletion logic here
                  const result = await deleteProject(
                    selectedProject?.project_id?.toString() as string
                  );
                  if (result.status) {
                    toast({
                      title: TOAST_SUCCESS_TITLE,
                      description: "The project has been deleted successfully.",
                      variant: "default",
                    });
                    setIsDeleteDialogOpen(false);
                  } else {
                    toast({
                      title: TOAST_ERROR_TITLE,
                      description: result.error,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Review project</DialogTitle>
              <DialogDescription>
                Review this project submission and decide whether to approve or
                reject.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                id="review-project-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormItem>
                  <FormLabel htmlFor="status" className="font-semibold">
                    Decision:
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a decision" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={"Approved"}>
                              Approve
                            </SelectItem>
                            <SelectItem value={"Rejected"}>
                              Reject
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
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Feedback:</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about your decision..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="review-project-form"
                className="bg-accentColor text-white hover:bg-secondaryColor"
                disabled={form.formState.isSubmitting}
              >
                {
                  form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  ):(
                    <>
                      Save changes
                    </>
                  )
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

