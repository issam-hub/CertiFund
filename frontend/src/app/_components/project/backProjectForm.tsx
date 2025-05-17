"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadStripe, StripeCardElement } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
import { backProjectSchema, BackProjectSchema } from "@/app/_lib/schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Trash } from "lucide-react";
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAtom, useAtomValue } from "jotai";
import { selectedRewardsAtom, userAtom } from "@/app/_store/shared";
import { backProject, createPaymentIntent } from "@/app/_actions/projects";
import { Label } from "@/components/ui/label";
import { Reward } from "@/app/_lib/types";

export function BackProjectForm({ projectId,rewards }: { projectId: number, rewards?:Reward[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const user = useAtomValue(userAtom)
  const {toast} = useToast()
  const stripe = useStripe();
  const elements = useElements();
  const [sharedSelectedRewards, setSharedSelectedRewards] = useAtom(selectedRewardsAtom)

  const toggleReward = (rewardId: number) => {
    setSharedSelectedRewards((prev) => (prev.includes(rewardId) ? prev.filter((id) => id !== rewardId) : [...prev, rewardId]))
  }

  const getSelectedRewardsData = () => {
    return rewards?.filter((reward) => sharedSelectedRewards.includes(reward.id))
  }

  const amountInRewards = getSelectedRewardsData()?.reduce((total, reward) => total + reward.amount, 0) as number

    const form = useForm<BackProjectSchema>({
      resolver: zodResolver(backProjectSchema)
    })

    const areThereRewards = (getSelectedRewardsData() ?? []).length > 0

    if(areThereRewards){
      form.setValue("amount", amountInRewards)
    }

      async function onSubmit(values: BackProjectSchema) {
        setIsLoading(true)

        const intent = await createPaymentIntent(Number(user?.user_id), projectId, areThereRewards ? values.amount : values.amount * 100)
        if (!intent.status){
          toast({
            title: TOAST_ERROR_TITLE,
            description: intent.error,
            variant: "destructive",
          });
          setIsOpen(false)
          setIsLoading(false)
          return;
        }

        const {client_secret} = intent

        const confirm = await stripe?.confirmCardPayment(client_secret, {
          payment_method: {
            card: elements?.getElement(CardElement) as StripeCardElement,
            billing_details: {
              email: user?.email,
            },
          },
        });

        if(confirm?.error){
          toast({
            title: TOAST_ERROR_TITLE,
            description: confirm.error.message,
            variant: "destructive",
          });
          setIsOpen(false)
          setIsLoading(false)
        }

        if(confirm?.paymentIntent?.status === "succeeded"){
          const result = await backProject({
            project_id: projectId,
            payment_intent_id: confirm.paymentIntent.id,
            payment_method: "card",
            rewards: getSelectedRewardsData()?.map((reward) => reward.id) ?? [],
          })
          if(result.status) {
            toast({
              title: TOAST_SUCCESS_TITLE,
              description: "Project is backed successfully",
              variant: "default",
            });
            setIsSuccess(true)
            setSharedSelectedRewards([])
          } else {
            toast({
              title: TOAST_ERROR_TITLE,
              description: result.error,
              variant: "destructive",
            });
          }
          setIsLoading(false)
        }

    
      }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#3B82F6] hover:bg-[#1E3A8A] text-lg py-6">
          Back This Project
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
            <DialogTitle className="text-xl mb-2">Thank You!</DialogTitle>
            <DialogDescription>
              Your pledge has been successfully processed. You'll receive a
              confirmation email shortly.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Back This Project</DialogTitle>
              <DialogDescription>
                Choose how much you'd like to contribute to help bring this
                project to life.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {
                  (getSelectedRewardsData()?.length ?? 0) > 0 ? (
                    <>
                    <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
                      {
                        getSelectedRewardsData()?.map((reward) => (
                          <div key={reward.id} className="flex justify-between items-start border-b pb-4">
                            <div>
                              <h4 className="font-medium">{reward.title}</h4>
                              <p className="text-sm text-muted-foreground">{reward.amount/100}DA</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => toggleReward(reward.id)}
                              >
                              <Trash className="h-4 w-4"/>
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                    <div>
                      <p className="font-medium">Total</p>
                      <p className="text-xl font-bold text-secondaryColor">
                        {amountInRewards/100}DA
                      </p>
                    </div>
                    </>
                  ):(
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Amount:</FormLabel>
                          <FormControl>
                            <Input {...form.register("amount",{setValueAs:(value)=>value ===""?undefined:Number(value)})} placeholder="0.00DA" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
                <div>
                    <Label className="font-semibold">Card Details:</Label>
                    <div className="mt-2 py-3 rounded-md border border-input px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                    <CardElement options={{
                        style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                            color: '#737373',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                        
                        }
                    }} />
                    </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accentColor hover:bg-secondaryColor"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Back this project
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

