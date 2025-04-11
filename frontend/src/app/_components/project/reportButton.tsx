"use client"

import type React from "react"

import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Flag, Upload, Loader2, AlertTriangle, FileText, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, useToast } from "@/hooks/use-toast"

import { createClient } from '@supabase/supabase-js';
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { FileWithUrl } from "@/app/_lib/types"
import { reportFormSchema, ReportFormSchema } from "@/app/_lib/schemas/project"
import { createDispute } from "@/app/_actions/projects"
import { supabaseServiceRoleKey, supabaseUrl } from "@/app/_lib/config"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Then, create a function to upload files (e.g., in utils/fileUpload.ts)
export async function uploadFile(file: File): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('disputeevidences')
    .upload(`evidences/${file.name}`, file);
  
  if (error) {
    toast({
      title: TOAST_ERROR_TITLE,
      description: error.message,
      variant:"destructive"
    })
    return null;
  }
  
  const { data: data2 } = await supabase.storage
    .from('disputeevidences')
    .createSignedUrl((`evidences/${file.name}`), 60 * 60 * 24 * 7);
    
  return data2?.signedUrl as string;
}

export function ReportButton({
  resourceId,
  title,
  context,
  reportTypes,
  buttonTrigger
}: {
  resourceId: number
  title: string
  context: "project" | "user" | "comment",
  reportTypes: { value: string; label: string }[],
  buttonTrigger: ReactNode
}) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileWithUrl[]>([])

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: "",
      description: "",
      evidences: [],
      context:context
    },
  })

  async function onSubmit(data: ReportFormSchema) {
    setIsSubmitting(true)

    const fileUrls = uploadedFiles
    .filter(file => file.url !== null)
    .map(file => file.url as string);

    data.evidences = fileUrls
  const result = await createDispute(resourceId, data)
  if(!result.status){
    toast({
      title: TOAST_ERROR_TITLE,
      description: result.error,
      variant: "destructive",
    })
    setIsOpen(false)
    setIsSubmitting(false)
    return;
  }

  toast({
    title: TOAST_SUCCESS_TITLE,
    description: "Thank you for your report. Our team will review it shortly.",
  })

  // Close the dialog and reset form
  setIsOpen(false)
  form.reset()
  setUploadedFiles([])


  setIsSubmitting(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    const newFiles = Array.from(fileList)

    if (uploadedFiles.length + newFiles.length > 3) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: "You can upload a maximum of 3 files as evidence.",
        variant: "destructive",
      })
      return
    }

    // Check if any file exceeds 10MB
    const exceedsSizeLimit = newFiles.some(file => file.size > 5 * 1024 * 1024) // 10MB
    if (exceedsSizeLimit) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: "Each file must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create new file entries with uploading status
    const newFileEntries: FileWithUrl[] = newFiles.map(file => ({
      file,
      url: null,
      isUploading: true
    }));
    
    // Add new files to the existing array
    const updatedFiles = [...uploadedFiles, ...newFileEntries];
    setUploadedFiles(updatedFiles);

    // Reset the input value to allow selecting the same file again
    e.target.value = ""

    // Upload each file and update its status
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileIndex = uploadedFiles.length + i;
      
      try {
        const url = await uploadFile(file);
        if(!url){
          return
        }
        
        // Update the file entry with the URL and set uploading to false
        setUploadedFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            url,
            isUploading: false
          };
          return updatedFiles;
        });
        
        // Update form value with URLs
        const allUrls = uploadedFiles
          .concat(newFileEntries)
          .filter(f => f.url !== null)
          .map(f => f.url as string);
        
        form.setValue("evidences", allUrls);
        
        console.log("File uploaded successfully:", url);
      } catch (error) {
        // Update the file entry to show upload failed
        setUploadedFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            isUploading: false
          };
          return updatedFiles;
        });
        
        console.error("Error uploading file:", error);
        toast({
          title: "File upload failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  }

  const removeFile = async(index: number) => {
    const updatedFiles = [...uploadedFiles];
    const deletedFiles = updatedFiles.splice(index, 1);
    
    const {data, error} = await supabase.storage.from('disputeevidences').remove([`evidences/${deletedFiles[0].file.name}`]);
    if(error){
      toast({
        title: TOAST_ERROR_TITLE,
        description:"Error happened while deleting the file",
        variant:"destructive"
      })
    }

    setUploadedFiles(updatedFiles);
    
    // Update form value with remaining URLs
    const remainingUrls = updatedFiles
      .filter(f => f.url !== null)
      .map(f => f.url as string);
    
    form.setValue("evidences", remainingUrls.length > 0 ? remainingUrls : []);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {buttonTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report {context}</DialogTitle>
          <DialogDescription>
            Submit a report if you believe this {context} violates our guidelines or terms of service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Reporting a {context} is a serious action. False reports may result in account restrictions.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-sm text-gray-500 mb-2">
              Reporting: <span className="font-medium text-gray-700 truncate">{title}</span>
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Report Type:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value === "" ? undefined : field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the category that best describes your concern</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Description:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide details about your concern..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific and include relevant details to help our team investigate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidences"
              render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Evidence (Optional):</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          className="hidden"
                          id="evidence-upload"
                          multiple
                          {...fieldProps}
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("evidence-upload")?.click()}
                          disabled={uploadedFiles.length >= 3}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                        <span className="text-sm text-gray-500">{uploadedFiles.length}/3 files</span>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((fileWithUrl, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="truncate max-w-[200px]">{fileWithUrl.file.name}</span>
                                <span className="text-gray-400 text-xs">
                                  ({(fileWithUrl.file.size / 1024).toFixed(0)} KB)
                                </span>
                                {fileWithUrl.isUploading && (
                                  <Loader2 className="h-3 w-3 animate-spin text-gray-500 ml-1" />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => removeFile(index)}
                                disabled={fileWithUrl.isUploading}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload screenshots or other evidence to support your report (max 3 files, 10MB each)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={()=>console.log(form.formState.errors)} type="submit" disabled={isSubmitting} className="bg-accentColor hover:bg-secondaryColor">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}