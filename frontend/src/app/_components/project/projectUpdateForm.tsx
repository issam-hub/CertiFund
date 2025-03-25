"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, FileText, Loader2 } from "lucide-react"
import { updateSchema, UpdateSchema } from "@/app/_lib/schemas/project"
import { publishUpdate } from "@/app/_actions/projects"
import { toast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"



export function ProjectUpdateForm({
  projectId,
  projectTitle,
  handleShowProjectUpdate
}: {
  projectId: string
  projectTitle: string
    handleShowProjectUpdate: (newValue: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState("write")

  const form = useForm<UpdateSchema>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  const watchTitle = form.watch("title")
  const watchContent = form.watch("content")

  const onSubmit = async (values: UpdateSchema) => {

    const result = await publishUpdate(values, projectId)

    if(result.status) {
        toast({
            title: TOAST_SUCCESS_TITLE,
            description: "Update published successfully",
        })
        handleShowProjectUpdate(false)
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>New Update for "{projectTitle}"</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="write" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Update Title:</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Production Milestone Reached!" {...field} />
                        </FormControl>
                        <FormDescription>A clear, concise title for your update.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Update Content:</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your progress, challenges, or exciting news with your backers..."
                            className="min-h-[300px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide detailed information about your project's progress. You can use line breaks for
                          paragraphs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => handleShowProjectUpdate(false)} disabled={form.formState.isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#3B82F6] hover:bg-[#1E3A8A]" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish Update"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-md p-6 bg-white">
                {watchTitle || watchContent ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">{watchTitle || "Update Title"}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Just now</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src="/placeholder.svg?height=20&width=20" alt="Your avatar" />
                            <AvatarFallback className="bg-[#1E3A8A] text-white text-xs">Y</AvatarFallback>
                          </Avatar>
                          <span>You</span>
                        </div>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{watchContent || "Your update content will appear here."}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">Preview Empty</p>
                    <p className="text-sm">Fill out the form in the Write tab to see a preview here.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleShowProjectUpdate(false)} disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-[#3B82F6] hover:bg-[#1E3A8A]"
                  disabled={form.formState.isSubmitting || !form.formState.isValid}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Update"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t px-6 py-4">
          <h3 className="font-medium mb-2">Tips for a great update:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Be specific about your progress and any challenges you've faced</li>
            <li>Thank your backers for their support</li>
            <li>Be honest and transparent about timelines</li>
            <li>End with clear next steps or what backers can expect</li>
          </ul>
        </CardFooter>
      </Card>
    </div>
  )
}

