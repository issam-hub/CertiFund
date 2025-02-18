"use client"
import React, { useCallback, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UpdateProjectSchema, createProjectSchema } from '@/app/lib/schemas/project';
import { reverseDateTimeFormat } from "@/app/lib/utils";
import StoryEditor from "@/app/components/project/storyEditor";
import ImageInput from "@/components/imageInput";
import { useToast } from "@/hooks/use-toast";
import { TOAST_SUCCESS_TITLE, TOAST_ERROR_TITLE } from "@/app/lib/constants";
import { updateProject, uploadImage } from '@/app/actions/projects';

interface ProjectFormProps {
  data: UpdateProjectSchema;
  activeTab: string;
  onStepComplete: (stepId: string) => void;
}

// Define interfaces for each step's data
export interface BasicsFormData {
  project_img: string | null;
  title: string;
  description: string;
  category: string;
}

export interface FundingFormData {
  funding_goal: number;
  deadline: string;
}

export interface StoryFormData {
  campaign: string
}


export default function ProjectForm({ data, activeTab, onStepComplete }: ProjectFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);

  const handleGetContent = useCallback((getContent: () => string) => {
    setGetEditorContent(() => getContent);
  }, []);

  const handleSaveStory = async() => {
    if (getEditorContent) {
      const content = getEditorContent();
      try {
        // Handle funding step submission
        await updateProject({
          "campaign": content
        }, data.project_id as string)
        
        toast({
          title: TOAST_SUCCESS_TITLE,
          description: "Story saved successfully",
          variant: "default",
        });
        
        onStepComplete('story');
      } catch (error) {
        toast({
          title: TOAST_ERROR_TITLE,
          description: (error as Error).message,
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
      category: true 
    })),
    defaultValues: {
      project_img: data.project_img,
      title: data.title,
      description: data.description,
      category: data.category
    }
  });

  const fundingForm = useForm<FundingFormData>({
    resolver: zodResolver(createProjectSchema.pick({ 
      funding_goal: true, 
      deadline: true 
    })),
    defaultValues: {
      funding_goal: data.funding_goal,
      deadline: data.deadline
    }
  });

  const handleBasicsSubmit = async (formData: BasicsFormData) => {
    try {

      const result = await uploadImage(imageFile as File)
      if(result.url){
        let toBeSentFormData = formData
        toBeSentFormData['project_img'] = result.url
        await updateProject(formData, data.project_id as string)
      }

      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Basics information saved successfully",
        variant: "default",
      });
      
      onStepComplete('basics');
    } catch (error) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleFundingSubmit = async (formData: FundingFormData) => {
    try {
      // Handle funding step submission
      await updateProject(formData, data.project_id as string)
      
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Funding information saved successfully",
        variant: "default",
      });
      
      onStepComplete('funding');
    } catch (error) {
      toast({
        title: TOAST_ERROR_TITLE,
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (activeTab === "basics") {
    return (
      <form onSubmit={basicsForm.handleSubmit(handleBasicsSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="description" className="font-semibold">Project Image:</Label>
          <ImageInput defaultValue={data.project_img as string} onImageChange={(imageUrl, file) => {
            setImageFile(file); 
          }}/>
        </div>
        <div>
          <Label htmlFor="title" className="font-semibold">Title:</Label>
          <Input
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
          <Label htmlFor="category" className="font-semibold">Category:</Label>
          <Controller
            control={basicsForm.control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} defaultValue={value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                  <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {basicsForm.formState.errors.category && (
            <p className="text-xs text-red-600">* {basicsForm.formState.errors.category.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-secondaryColor hover:bg-secondaryColor"
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
            defaultValue={reverseDateTimeFormat(data.deadline)}
          />
          {fundingForm.formState.errors.deadline && (
            <p className="text-xs text-red-600">* {fundingForm.formState.errors.deadline.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-secondaryColor hover:bg-secondaryColor"
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
        defaultvalue={data.campaign as string} 
        onGetContent={handleGetContent}  // Changed prop name
      />
      <Button 
        onClick={handleSaveStory}
        className="w-full bg-secondaryColor hover:bg-secondaryColor"
      >
        Save Story
      </Button>
    </div>
    );
  }

  if (activeTab === "rewards") {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          Rewards content goes here
        </p>
        <Button 
          onClick={() => onStepComplete('rewards')}
          className="w-full bg-secondaryColor hover:bg-secondaryColor"
        >
          Save Rewards
        </Button>
      </div>
    );
  }

  return null;
}