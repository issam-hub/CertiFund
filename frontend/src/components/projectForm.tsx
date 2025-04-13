"use client"
import React, { useCallback, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RewardsSchema, UpdateProjectSchema, createProjectSchema, rewardsSchema } from '@/app/_lib/schemas/project';
import { cn, reverseDateTimeFormat } from "@/app/_lib/utils";
import StoryEditor from "@/app/_components/project/storyEditor";
import ImageInput from "@/components/imageInput";
import { useToast } from "@/hooks/use-toast";
import { TOAST_SUCCESS_TITLE, TOAST_ERROR_TITLE } from "@/app/_lib/constants";
import { handleRewards, updateProject, uploadImage } from '@/app/_actions/projects';
import MultiSelect, { renderCategories } from './multiSelect';
import { BasicsFormData, FundingFormData, Reward } from '@/app/_lib/types';
import { userAtom } from '@/app/_store/shared';
import { useAtomValue } from 'jotai';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Badge } from './ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, PlusCircle, Trash, Upload, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from "date-fns"

interface ProjectFormProps {
  data: UpdateProjectSchema&{rewards?:Reward[]};
  activeTab: string;
  onStepComplete: (stepId: string) => void;
}



export default function ProjectForm({ data, activeTab, onStepComplete }: ProjectFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);

  const disableEdit = (data.status === "Live" || data.status === "Completed")

  const handleGetContent = useCallback((getContent: () => string) => {
    setGetEditorContent(() => getContent);
  }, []);

  const user = useAtomValue(userAtom)


  const handleSaveStory = async() => {
    if (getEditorContent) {
      const content = getEditorContent();
      const result = await updateProject({
        "campaign": content
      }, data.project_id as string)
      if(result.status) {
        toast({
          title: TOAST_SUCCESS_TITLE,
          description: "Story saved successfully",
          variant: "default",
        });
        
        onStepComplete('story');
      } else {
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant: "destructive",
        });
      }
    }
  };
  // Create separate form instances for each step
  const basicsForm = useForm<BasicsFormData>({
    resolver: zodResolver(createProjectSchema.pick({ 
      title: true, 
      description: true, 
      categories: true 
    })),
    defaultValues: {
      project_img: data.project_img,
      title: data.title,
      description: data.description,
      categories: data.categories,
    }
  });

  const fundingForm = useForm<FundingFormData>({
    resolver: zodResolver(createProjectSchema.pick({ 
      funding_goal: true, 
      deadline: true 
    })),
    defaultValues: {
      funding_goal: data.funding_goal,
      deadline: reverseDateTimeFormat(data.deadline),
    }
  });

  const handleBasicsSubmit = async (formData: BasicsFormData) => {
    let toBeSentFormData = formData
    if(!data.project_img){
      const result = await uploadImage(imageFile as File)
      if(!result.status){
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant: "destructive",
        });
      }
      if(result.url){
        toBeSentFormData['project_img'] = result.url
      }
    }
    const res = await updateProject(toBeSentFormData, data.project_id as string)
    if(res.status) {

      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Basics information saved successfully",
        variant: "default",
      });
      
      onStepComplete('basics');
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: res.error,
        variant: "destructive",
      });
    }
  };

  const handleFundingSubmit = async (formData: FundingFormData) => {
    const result = await updateProject(formData, data.project_id as string)
    if(result.status) {
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Funding information saved successfully",
        variant: "default",
      });
      
      onStepComplete('funding');
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const defaultImages: {[key: number]: {value:string, isUploading: boolean}} = {};

  data["rewards"]?.forEach((reward, index) => {
    defaultImages[index] = {value:reward.image_url, isUploading:false};
  });

  const [previewImages, setPreviewImages] = useState<{ [key: number]: {value: string, isUploading: boolean} }>(defaultImages)
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadingWithIndex, setLoadingWithIndex] = useState([{isIt: false}])
  const carouselRef = useRef<HTMLDivElement>(null)

  const rewards = data["rewards"] ? data["rewards"].map((reward)=> {
    return {
      ...reward,
      amount: reward.amount / 100
  }}) : []

  // Initialize the form
  const rewardsForm = useForm<RewardsSchema>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      rewards: rewards
    },
  })

  // Use field array for dynamic rewards
  const {
    fields: rewardFields,
    append: appendReward,
    remove: removeReward,
  } = useFieldArray({
    control: rewardsForm.control,
    name: "rewards",
  })


  // Handle image upload
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async() => {
        // Update the preview image
        setPreviewImages((prev) => ({
          ...prev,
          [index]: {value: reader.result as string, isUploading:true},
        }))

        // Update the form value
        if(!data["rewards"]?.[index]?.image_url){
          const result = await uploadImage(file)
          if(!result.status){
            toast({
              title: TOAST_ERROR_TITLE,
              description: result.error,
              variant: "destructive",
            });
          }
          if(result.url){
            rewardsForm.setValue(`rewards.${index}.image_url`, result.url)
          }
        }
        setPreviewImages((prev) => ({
          ...prev,
          [index]: {value: reader.result as string, isUploading:false},
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Navigate to previous reward
  const prevReward = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
      scrollToCard(activeIndex - 1)
    }
  }

  // Navigate to next reward
  const nextReward = () => {
    if (activeIndex < rewardFields.length - 1) {
      setActiveIndex(activeIndex + 1)
      scrollToCard(activeIndex + 1)
    }
  }

  // Scroll to a specific card
  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector(".reward-card")?.clientWidth || 0
      const scrollPosition = index * (cardWidth + 16) // 16px for gap
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }

  // Add a new reward and navigate to it
  const addNewReward = () => {
    appendReward({ title: "", amount: 0, description: "", includes: [""], estimated_delivery: new Date() })
    const newIndex = rewardFields.length
    setActiveIndex(newIndex)
    // Wait for the DOM to update before scrolling
    setTimeout(() => scrollToCard(newIndex), 100)
  }

  const handleRewardsSubmit = async (formData: RewardsSchema) => {
    const type = (data["rewards"]?.length ?? 0) > 0 ? "update" : "create"
    const result = await handleRewards(formData, data.project_id as string, type)
    if(result.status) {
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: `Rewards ${type === "create" ? "added" : "updated"} successfully`,
        variant: "default",
      });
      
      onStepComplete('rewards');
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (activeTab === "basics") {
    return (
      <form onSubmit={basicsForm.handleSubmit(handleBasicsSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="description" className="font-semibold">Project Image:</Label>
          <ImageInput disableEdit={disableEdit} defaultValue={data.project_img as string} onImageChange={(imageUrl, file) => {
            setImageFile(file); 
          }}/>
        </div>
        <div>
          <Label htmlFor="title" className="font-semibold">Title:</Label>
          <Input
            disabled={disableEdit}
            id="title"
            {...basicsForm.register("title")}
            placeholder="Enter the project title"
          />
          {basicsForm.formState.errors.title && (
            <p className="text-xs text-red-600">* {basicsForm.formState.errors.title.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="description" className="font-semibold">Description:</Label>
          <Textarea
            disabled={disableEdit}
            id="description"
            className="min-h-28"
            {...basicsForm.register("description")}
            placeholder="Enter the project description"
          />
          {basicsForm.formState.errors.description && (
            <p className="text-xs text-red-600">* {basicsForm.formState.errors.description.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category" className="font-semibold">Categories:</Label>
          <MultiSelect disableEdit={disableEdit} register={basicsForm.register} control={basicsForm.control} errors={basicsForm.formState.errors}/>
        </div>
        <Button 
          type="submit" 
          className={`w-full bg-secondaryColor hover:bg-secondaryColor ${disableEdit ? 'hidden': ''}`}
          disabled={basicsForm.formState.isSubmitting}
        >
          Save Basics
        </Button>
      </form>
    );
  }

  if (activeTab === "funding") {
    return (
      <form onSubmit={fundingForm.handleSubmit(handleFundingSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fundingGoal" className="font-semibold">Funding Goal:</Label>
          <Input
            id="fundingGoal"
            type="number"
            {...fundingForm.register("funding_goal", { valueAsNumber: true })}
            placeholder="Enter funding goal"
            disabled={disableEdit}
          />
          {fundingForm.formState.errors.funding_goal && (
            <p className="text-xs text-red-600">* {fundingForm.formState.errors.funding_goal.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="deadline" className="font-semibold">Deadline:</Label>
          <Input
            id="deadline"
            type="datetime-local"
            {...fundingForm.register("deadline")}
            disabled={disableEdit}
            // defaultValue={reverseDateTimeFormat(data.deadline)}
          />
          {fundingForm.formState.errors.deadline && (
            <p className="text-xs text-red-600">* {fundingForm.formState.errors.deadline.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className={`w-full bg-secondaryColor hover:bg-secondaryColor ${disableEdit ? 'hidden': ''}`}
          disabled={fundingForm.formState.isSubmitting}
        >
          Save Funding Details
        </Button>
      </form>
    );
  }

  if (activeTab === "story") {
    return (
      <div className="space-y-4">
      <StoryEditor
        disableEdit={disableEdit}
        defaultvalue={data.campaign as string} 
        onGetContent={handleGetContent}  // Changed prop name
      />
      <Button
        onClick={handleSaveStory}
        className={`w-full bg-secondaryColor hover:bg-secondaryColor ${disableEdit ? 'hidden': ''}`}
      >
        Save Story
      </Button>
    </div>
    );
  }

  if (activeTab === "rewards") {
    return (
      <div className="space-y-4">
        <Form {...rewardsForm}>
          <form onSubmit={rewardsForm.handleSubmit(handleRewardsSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-row-reverse items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-accentColor/20 text-secondaryColor"
                  >
                    {rewardFields.length}{" "}
                    {rewardFields.length === 1 ? "tier" : "tiers"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={prevReward}
                      disabled={activeIndex === 0}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={nextReward}
                      disabled={activeIndex === rewardFields.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {rewardFields.map((field, rewardIndex) => (
                    <Card
                      key={field.id}
                      className={cn(
                        "reward-card flex-shrink-0 w-full max-w-md border snap-start",
                        activeIndex === rewardIndex
                          ? "border-slate-300"
                          : "border-accentColor/30"
                      )}
                      onClick={() => setActiveIndex(rewardIndex)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">
                            Reward Tier {rewardIndex + 1}
                          </h3>
                          {rewardFields.length >= 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={disableEdit}
                              size="sm"
                              onClick={() => {
                                removeReward(rewardIndex);
                                setActiveIndex(
                                  Math.min(activeIndex, rewardFields.length - 2)
                                );
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Remove reward</span>
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={rewardsForm.control}
                            name={`rewards.${rewardIndex}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='font-semibold'>Title:</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Early Supporter"
                                    disabled={disableEdit}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-4">
                            <FormField
                              control={rewardsForm.control}
                              name={`rewards.${rewardIndex}.amount`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className='font-semibold'>Amount (DA)</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={disableEdit}
                                      type="number"
                                      placeholder="50"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={rewardsForm.control}
                              name={`rewards.${rewardIndex}.estimated_delivery`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className='font-semibold'>Delivery:</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          disabled={disableEdit}
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "MMM yyyy")
                                          ) : (
                                            <span>Select</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={field.value as Date}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date() || disableEdit}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={rewardsForm.control}
                            name={`rewards.${rewardIndex}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='font-semibold'>Description:</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Be among the first to support this project..."
                                    className="resize-none"
                                    disabled={disableEdit}
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={rewardsForm.control}
                            name={`rewards.${rewardIndex}.image_url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='font-semibold'>Reward Image (Optional):</FormLabel>
                                <FormControl>
                                  <div className="flex justify-center px-4 py-3 border border-dashed border-accentColor/50 rounded-md">
                                    {previewImages[rewardIndex] ? (
                                      <div className="relative w-full">
                                        <img
                                          src={
                                            previewImages[rewardIndex].value ||
                                            "/placeholder.svg"
                                          }
                                          alt="Preview"
                                          className="mx-auto h-32 object-contain"
                                        />
                                        {
                                          previewImages[rewardIndex].isUploading && (
                                            <Loader2 className="absolute top-[80%] left-[60%] h-5 w-5 animate-spin text-gray-400" />
                                          )
                                        }
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          disabled={disableEdit}
                                          size="sm"
                                          className="absolute top-0 right-0 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImages((prev) => {
                                              const newPreviews = { ...prev };
                                              delete newPreviews[rewardIndex];
                                              return newPreviews;
                                            });
                                            rewardsForm.setValue(
                                              `rewards.${rewardIndex}.image_url`,
                                              undefined
                                            );
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <label
                                          htmlFor={`image-${rewardIndex}`}
                                          className="mt-1 cursor-pointer text-sm font-medium text-primary hover:text-secondaryColor block"
                                        >
                                          Upload image
                                          <input
                                            disabled={disableEdit}
                                            id={`image-${rewardIndex}`}
                                            name={`image-${rewardIndex}`}
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleImageUpload(rewardIndex, e)
                                            }
                                          />
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={rewardsForm.control}
                            name={`rewards.${rewardIndex}.includes`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel className="mb-0 font-semibold">
                                    Features (Includes):
                                  </FormLabel>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={disableEdit}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentFeatures =
                                      rewardsForm.getValues(
                                          `rewards.${rewardIndex}.includes`
                                        ) || [];
                                        rewardsForm.setValue(
                                        `rewards.${rewardIndex}.includes`,
                                        [...currentFeatures, ""]
                                      );
                                    }}
                                    className="text-primary hover:text-secondaryColor h-7 px-2"
                                  >
                                    <PlusCircle className="h-3 w-3 mr-[1px]" />
                                    Add
                                  </Button>
                                </div>

                                <FormControl>
                                  <div className="space-y-2">
                                    {field.value?.map((_, featureIndex) => (
                                      <div
                                        key={featureIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <FormField
                                          control={rewardsForm.control}
                                          name={`rewards.${rewardIndex}.includes.${featureIndex}`}
                                          render={({ field }) => (
                                            <FormItem className="flex-1 space-y-0">
                                              <FormControl>
                                                <Input
                                                  disabled={disableEdit}
                                                  placeholder="Digital thank you certificate"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const currentFeatures = [
                                              ...(rewardsForm.getValues(
                                                `rewards.${rewardIndex}.includes`
                                              ) || [""]),
                                            ];
                                            if (currentFeatures.length > 1) {
                                              currentFeatures.splice(
                                                featureIndex,
                                                1
                                              );
                                              rewardsForm.setValue(
                                                `rewards.${rewardIndex}.includes`,
                                                currentFeatures
                                              );
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                          disabled={field.value.length <= 1 || disableEdit}
                                        >
                                          <Trash className="h-4 w-4" />
                                          <span className="sr-only">
                                            Remove feature
                                          </span>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add new reward card */}
                  <Card
                    className={`reward-card flex-shrink-0 w-full max-w-md border border-dashed border-accentColor/50 flex items-center justify-center cursor-pointer transition-colors snap-start ${!disableEdit && "hover:border-secondaryColor"}`}
                    onClick={()=>{
                      !disableEdit && addNewReward()
                    }}
                  >
                    <CardContent className={`flex flex-col items-center justify-center p-8 h-full ${disableEdit && "opacity-60"}`}>
                      <div className="rounded-full bg-accentColor/20 p-4 mb-4">
                        <PlusCircle className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-secondaryColor">
                        Add New Reward Tier
                      </p>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Create another reward option for your backers
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

          {
            !disableEdit && (
              <Button
                type='submit'
                disabled={rewardsForm.formState.isSubmitting}
                className={`w-full bg-secondaryColor hover:bg-secondaryColor`}
              >
                Save Rewards
              </Button>
            ) 
          }
          </form>
        </Form>
      </div>
    );
  }

  return null;
}