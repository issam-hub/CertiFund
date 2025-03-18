"use client"

import type React from "react"

import { useState } from "react"
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
import { useForm } from "react-hook-form";
import { refundSchema, RefundSchema } from "@/app/_lib/schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { refundBacking } from "@/app/_actions/projects";

export function RefundButton({ projectId }: { projectId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const {toast} = useToast()

    const form = useForm<RefundSchema>({
      resolver: zodResolver(refundSchema),
      defaultValues:{
        reason: ""
      }
    })

    async function onSubmit(values: RefundSchema){
        setIsOpen(false)
        const result = await refundBacking(projectId, values.reason)
        if(result.status){
            toast({
                title: TOAST_SUCCESS_TITLE,
                description: "Backing refunded successfully",
                variant: "default",
            });
            setIsSuccess(true)
            setTimeout(()=>{
                setIsOpen(true)
            },1000)
        }else{
            toast({
                title: TOAST_ERROR_TITLE,
                description: result.error,
                variant: "destructive",
            });
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full text-accentColor border-2 border-accentColor hover:text-secondaryColor hover:border-secondaryColor hover:bg-white bg-white text-lg py-6">
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="py-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl mb-2">Refund Processed Successfully!</DialogTitle>
            <DialogDescription>
            Your backing has been successfully refunded, check your inbox for the receipt. We're sorry to see you go! If you have any feedback or need assistance, feel free to reach out.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cancel Backing</DialogTitle>
              <DialogDescription>
                You could tell us what made cancell your backing.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-3">
                        <FormLabel className="font-semibold">Reason (optional):</FormLabel>
                        <span className="text-xs text-gray-500">{form.getValues("reason") ? form.watch("reason")?.length : 0}/500 characters</span>
                    </div>
                    <FormControl>
                      <Textarea rows={5} placeholder="Write what made you refund your backing..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <Button
                  type="submit"
                  className="w-full bg-accentColor hover:bg-secondaryColor"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Confirm refunding
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


