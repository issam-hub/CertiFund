"use client"
import React, { useEffect, useState } from 'react';
import { cn } from "@/app/_lib/utils";
import { Check, ChevronDown, Frown, Goal, Hourglass, LucideIcon, PartyPopper, Rocket, Target, Timer, Trash2, Trophy, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { UpdateProjectSchema } from '@/app/_lib/schemas/project';
import ProjectForm from '@/components/projectForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deleteProject, updateProject } from '@/app/_actions/projects';
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from '@/app/_lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';

const projectRules = [
  "All projects must have a clear goal and timeline",
  "Fundraising goals must be realistic and well-justified",
  "Project creators must be transparent about risks and challenges",
  "Regular updates must be provided to backers",
  "Projects must comply with all applicable laws and regulations",
  "Creators are obligated to deliver promised rewards or refund backers, even if the project fails post-funding",
];

interface ProjectOverviewProps {
  data: UpdateProjectSchema
}

// New interface for circle customization
interface TimelineCircleProps {
  isCompleted?: boolean;
  stepNumber?: string;
  className?: string;
  icon?: LucideIcon;
  content?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

// Updated base timeline step interface
interface TimelineStepBaseProps {
  stepId: string;
  showLine?: boolean;
  circleContent?: React.ReactNode;
  circleClassName?: string;
}

// Regular timeline step props
interface RegularTimelineStepProps extends TimelineStepBaseProps {
  title: string;
  stepNumber: string;
  children?: React.ReactNode;
  onStepClick?: () => void;
  isCompleted?: boolean;
}

// Dynamic timeline step props
interface DynamicTimelineStepProps extends TimelineStepBaseProps {
  content: React.ReactNode;
  stepNumber?: string;
  isCompleted?: boolean;
  circleContent?: React.ReactNode;
  circleIcon?: LucideIcon;
  circleClassName?: string;
  circleBgColor?: string;
  circleTextColor?: string;
}

// Updated Timeline Circle component
const TimelineCircle = ({ 
  isCompleted, 
  stepNumber,
  className,
  icon: Icon,
  content,
  bgColor,
  textColor
}: TimelineCircleProps) => (
  <div className={cn(
    "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background text-secondaryColor z-10 relative -translate-y-4",
    isCompleted ? "border-secondaryColor bg-secondaryColor text-white" : "border-secondaryColor",
    bgColor && `bg-${bgColor}`,
    textColor && `text-${textColor}`,
    className
  )}>
    {content ? content : 
      Icon ? <Icon className="w-5 h-5" /> : 
      isCompleted ? <Check className="w-5 h-5" /> : 
      stepNumber
    }
  </div>
);

// Timeline Line component remains the same
const TimelineLine = () => (
  <div className="absolute w-0.5 bg-secondaryColor top-0 bottom-0 left-1/2 -translate-x-1/2" />
);

// Updated Regular TimelineStep component
const TimelineStep = ({ 
  stepId, 
  title,
  stepNumber,
  children,
  isCompleted,
  showLine = true,
  onStepClick,
  circleContent,
  circleClassName
}: RegularTimelineStepProps) => (
  <div className="flex gap-8 max-lg:gap-3 relative">
    <div className="relative flex items-center justify-center w-8">
      {showLine && <TimelineLine />}
      <TimelineCircle 
        content={circleContent}
        className={circleClassName}
        stepNumber={stepNumber}
        isCompleted={isCompleted}
      />
    </div>
    <div className="flex-1 min-h-[60px] pb-8">
      <div className="border rounded-lg">
        <div 
          className={cn(
            "p-4 cursor-pointer flex items-center gap-4 bg-background hover:bg-accent transition-colors justify-between"
          )}
          onClick={onStepClick}
        >
          <h3 className="font-semibold">{title}</h3>
          <ChevronDown className={cn("w-5 h-5 transition-transform", children ? "transform rotate-180" : "")} />
        </div>
        {children && (
          <div className="p-4 border-t bg-background/50">
            {children}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Updated Dynamic TimelineStep component
const DynamicTimelineStep = ({ 
  stepId, 
  stepNumber,
  content,
  isCompleted,
  showLine = true,
  circleContent,
  circleIcon,
  circleClassName,
  circleBgColor,
  circleTextColor
}: DynamicTimelineStepProps) => (
  <div className="flex gap-8 max-lg:gap-3 relative">
    <div className="relative flex items-center justify-center w-8">
      {showLine && <TimelineLine />}
      <TimelineCircle 
        isCompleted={isCompleted}
        stepNumber={stepNumber}
        content={circleContent}
        icon={circleIcon}
        className={circleClassName}
        bgColor={circleBgColor}
        textColor={circleTextColor}
      />
    </div>
    <div className="flex-1 min-h-[60px] pb-8">
      {content}
    </div>
  </div>
);

function getTimeDifference(dateString: string): string {
  // Parse the input date
  const inputDate = new Date(dateString);
  const now = new Date();
  
  // Calculate the difference in milliseconds
  const diffMs = inputDate.getTime() - now.getTime();
  
  // Convert to days, hours, and minutes
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format the output with padded zeros
  const formattedDays = String(Math.abs(days)).padStart(2, '0');
  const formattedHours = String(Math.abs(hours)).padStart(2, '0');
  const formattedMinutes = String(Math.abs(minutes)).padStart(2, '0');
  
  return `${formattedDays}d ${formattedHours}h ${formattedMinutes}m`;
}

export default function ProjectOverview({ data }: ProjectOverviewProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>(getTimeDifference(data.deadline));
  const {toast} = useToast()
  const router = useRouter()

  const currentFund = ((data.current_funding * 100) / data.funding_goal).toFixed(2)

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  const isGoalReached = data.current_funding >= data.funding_goal

  const markStepAsCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  useEffect(()=>{
    if(data.title && data.categories.length !== 0 && data.description && data.project_img){
      markStepAsCompleted("basics");
    }
    if(data.funding_goal && data.deadline){
      markStepAsCompleted("funding");
    }
    if(data.campaign){
      markStepAsCompleted("story");
    }
  },[completedSteps])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeDifference(data.deadline));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAgreeToRules = () => {
    markStepAsCompleted("rules");
    setExpandedStep("");
  };

  return (
    <div className="container mx-auto py-8 max-w-[80%] max-lg:max-w-full max-lg:px-2 mb-[70px]">
      <h1 className="text-3xl font-bold text-center">{data.title}</h1>
      <div className='text-center mt-3 mb-12 space-x-2'>
        {
          data.categories && data.categories.map((category, index) => (
            <Badge key={index} variant="outline" className='rounded-full'>{category}</Badge>
          ))
        }
      </div>

      {
        data.status === "Draft" && (
          <div>
          <h2 className="text-2xl mb-4 text-slate-600">Rules</h2>
          <TimelineStep 
            stepId="rules" 
            title="Project Rules" 
            stepNumber="1"
            isCompleted={isStepCompleted("rules")}
            onStepClick={() => setExpandedStep(expandedStep === "rules" ? "" : "rules")}
          >
            {expandedStep === "rules" && (
              <div className="space-y-4">
                {projectRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p>{rule}</p>
                  </div>
                ))}
                <div>
                  <Button
                    className="w-full mt-4 bg-secondaryColor hover:bg-secondaryColor"
                    onClick={handleAgreeToRules}
                  >
                    I Agree to These Rules
                  </Button>
                  <Link
                    href={"#"}
                    className="text-sm text-muted-foreground underline block text-center mt-2"
                  >
                    For more details check our rules
                  </Link>
                </div>
              </div>
            )}
          </TimelineStep>
        </div>
        )
      }

      <div>
        <h2 className="text-2xl mb-4 text-slate-600">Project Details</h2>
        <TimelineStep 
          stepId="basics" 
          title="Project Basics" 
          stepNumber="2"
          isCompleted={isStepCompleted("basics")}
          onStepClick={() => setExpandedStep(expandedStep === "basics" ? "" : "basics")}
        >
          {expandedStep === "basics" && (
            <ProjectForm data={data} activeTab="basics" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep 
          stepId="funding" 
          title="Funding Details" 
          stepNumber="3"
          isCompleted={isStepCompleted("funding")}
          onStepClick={() => setExpandedStep(expandedStep === "funding" ? "" : "funding")}
        >
          {expandedStep === "funding" && (
            <ProjectForm data={data} activeTab="funding" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep 
          stepId="story" 
          title="Story" 
          stepNumber="4"
          isCompleted={isStepCompleted("story")}
          onStepClick={() => setExpandedStep(expandedStep === "story" ? "" : "story")}
        >
          {expandedStep === "story" && (
            <ProjectForm data={data} activeTab="story" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep 
          stepId="rewards" 
          title="Rewards (optional)" 
          stepNumber="5"
          isCompleted={isStepCompleted("rewards")}
          onStepClick={() => setExpandedStep(expandedStep === "rewards" ? "" : "rewards")}
        >
          {expandedStep === "rewards" && (
            <ProjectForm data={data} activeTab="rewards" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>
      </div>
      {
        (data.status !== "Live" && data.status !== "Completed") ? (
        <div>
          <h2 className="text-2xl mb-4 text-slate-600">Project Review</h2>
          {
            data.status === "Draft" && (
              <DynamicTimelineStep
                stepId="submit"
                stepNumber="6"
                content={
                  <Button onClick={async()=>{
                    const isEverythingCompleted = ['story', 'funding', 'basics', 'rules'].filter(item => completedSteps.indexOf(item) < 0)
                    if(isEverythingCompleted.length !== 0){
                      toast({
                        title: "Warning",
                        description: "Please complete all the steps before submitting",
                        variant: "warning",
                      });
                      return;
                    }
                    const result = await updateProject({status:"Pending Review"}, data.project_id as string)
                    if(result.status) {
                      toast({
                        title: TOAST_SUCCESS_TITLE,
                        description: "Project submitted successfully",
                        variant: "default",
                      });
                    
                      markStepAsCompleted('submit');
                    } else {
                      toast({
                        title: TOAST_ERROR_TITLE,
                        description: result.error,
                        variant: "destructive",
                      });
                    }
                  }} className='bg-secondaryColor hover:bg-secondaryColor'>Submit for Review</Button>
                }
              />
            )
          }
          {data.status === "Pending Review" && (
            <DynamicTimelineStep
              stepId="review"
              circleIcon={Hourglass}
              content={
                <div className={`mt-[3px] border-2 border-orange-400 border-dashed px-5 py-3 rounded-md`}>
                  <div className='flex items-center gap-2 text-orange-400'>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                    </span>
                    <span className='font-semibold'>Pending Review...</span>
                  </div>
                  <span className='text-xs'>Estimated completion time: <span className='font-bold'>24-48 hours</span></span>
                </div>
              }
            />
          )}
          {data.status === "Rejected" && (
            <>
            <DynamicTimelineStep
              stepId="reject"
              circleIcon={X}
              circleBgColor='secondaryColor'
              circleTextColor='white'
              content={
                <div className={`mt-[3px] border-2 border-red-500 border-dashed px-5 py-3 rounded-md`}>
                  <span className='text-red-500 font-semibold'>Project rejected</span>
                  <div className='text-xs text-slate-600'>Your campaign cannot be published at this time</div>
                </div>
              }
            />
            <DynamicTimelineStep
            stepId="submit"
            stepNumber="7"
            content={
              <Button onClick={async()=>{
                const isEverythingCompleted = ['story', 'funding', 'basics', 'rules'].filter(item => completedSteps.indexOf(item) < 0)
                if(isEverythingCompleted.length !== 0){
                  toast({
                    title: "Warning",
                    description: "Please complete all the steps before submitting",
                    variant: "warning",
                  });
                  return;
                }
                const result = await updateProject({status:"Pending Review"}, data.project_id as string)
                if(result.status) {
                  toast({
                    title: TOAST_SUCCESS_TITLE,
                    description: "Project submitted successfully",
                    variant: "default",
                  });
                
                  markStepAsCompleted('submit');
                } else {
                  toast({
                    title: TOAST_ERROR_TITLE,
                    description: result.error,
                    variant: "destructive",
                  });
                }
              }} className='bg-secondaryColor hover:bg-secondaryColor'>Submit for Review</Button>
            }
          />
          </>
          )}
          {data.status === "Approved" && (
            <DynamicTimelineStep
              stepId="approve"
              isCompleted={true}
              content={
                <div className={`mt-[3px] border-2 border-green-500 border-dashed px-5 py-3 rounded-md`}>
                  <span className='text-green-500 font-semibold'>Project approved</span>
                  <div className='text-xs text-slate-600'>Congratulations! Your campaign has been reviewed and approved. You're ready to start accepting backers.</div>
                  <Button onClick={async()=>{
                    const result = await updateProject({status:"Live"}, data.project_id as string)
                    if(result.status) {
                      toast({
                        title: TOAST_SUCCESS_TITLE,
                        description: "Project launched successfully",
                        variant: "default",
                      });
                    
                    } else {
                      toast({
                        title: TOAST_ERROR_TITLE,
                        description: result.error,
                        variant: "destructive",
                      });
                    }
                  }} className='mt-5 bg-green-700 hover:bg-green-700'>Launch project</Button>
                </div>
              }
          />
          )}
        </div>
        ):(
          <div>
            <h2 className="text-2xl mb-4 text-slate-600">Campaign Status</h2>
            {
              data.status === "Live" && (
                <DynamicTimelineStep
                  stepId="live"
                  circleIcon={Rocket}
                  circleBgColor='secondaryColor'
                  circleTextColor='white'
                  content={
                    <div className={`mt-[3px] border-2 border-secondaryColor border-dashed px-5 py-3 rounded-md`}>
                      <h2 className='flex items-center'>Project is now live<PartyPopper className='ml-3 h-6 w-6 text-secondaryColor'/></h2>
                      <div className='flex justify-between items-center gap-5 mt-4'>
                        <div className='rounded-md w-1/2 p-3 bg-slate-100'>
                          <div>
                            <div className='flex justify-between items-center'>
                              <div className='flex gap-2 items-center'>
                                <Target className='w-6 h-6 text-secondaryColor' />
                                <p className='text-sm'>Current funding</p>
                              </div>
                              <p className='text-secondaryColor font-semibold text-sm'>{currentFund}%</p>
                            </div>
                            <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
                              <div style={{width:`${currentFund}%`}} className='h-2 rounded-full bg-secondaryColor absolute top-0 left-0'></div>
                            </div>
                          </div>
                        </div>
                        <div className='flex rounded-md bg-slate-100 p-3 w-1/2 justify-between items-center self-stretch'>
                          <div className='flex gap-2 items-center'>
                            <Timer className='h-6 w-6 text-secondaryColor' />
                            <p className='text-sm'>Time remaining</p>
                          </div>
                          <p className='text-secondaryColor font-semibold text-sm'>{timeRemaining}</p>
                        </div>
                      </div>
                    </div>
                  }
                />
              )
            }
            {
              data.status === "Completed" && (
                <DynamicTimelineStep
                stepId="completed"
                circleIcon={isGoalReached ? Trophy : X}
                circleBgColor='secondaryColor'
                circleTextColor='white'
                content={
                  <div className={`mt-[3px] border-2 border-dashed px-5 py-3 rounded-md ${isGoalReached ? "border-green-500" : "border-orange-200"}`}>
                    <h2 className='flex items-center'>
                      {
                        isGoalReached ? (
                          <div className='flex text-green-500'>Campaign Successfully Completed!<PartyPopper className='ml-3 h-6 w-6 text-green-500'/></div>
                        ):(
                          <div className='text-orange-900 flex'>Campaign Ended - Goal Not Reached <Frown className='ml-3 h-6 w-6 text-orange-900' /></div>
                        )
                      }
                    </h2>
                    <div className={`mt-4 flex flex-wrap justify-around text-center border ${!isGoalReached ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"} rounded-md p-3`}>
                      <div>
                        <span className={`text-sm ${!isGoalReached ? "text-orange-600" : "text-green-500"}`}>Total Raised</span>
                        <h4 className={`${!isGoalReached ? "text-orange-900" : "text-green-800"}`}>${data.current_funding}</h4>
                      </div>
                      <div>
                        <span className={`text-sm ${!isGoalReached ? "text-orange-600" : "text-green-500"}`}>Total Backers</span>
                        <h4 className={`${!isGoalReached ? "text-orange-900" : "text-green-800"}`}>254</h4>
                      </div>
                      <div>
                        <span className={`text-sm ${!isGoalReached ? "text-orange-600" : "text-green-500"}`}>Goal Achievement</span>
                        <h4 className={`${!isGoalReached ? "text-orange-900" : "text-green-800"}`}>{currentFund}%</h4>
                      </div>
                    </div>
                    {
                      !isGoalReached && (
                      <div className='text-sm mt-4 text-orange-800 bg-orange-50 border border-orange-200 rounded-md p-3'>
                        Since the funding goal wasn't reached, all pledges will be automatically refunded to backers within 5-7 business days.
                      </div>
                      )
                    }
                  </div>
                }
              />
              )
            }
          </div>
        )
      }
      <AlertDialog>
        <AlertDialogTrigger className='rounded-md h-9 px-4 py-2 flex gap-2 items-center text-sm text-red-500 border border-red-500 float-right mt-5'><Trash2 className='h-4 w-4'/>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project
              and remove it's data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async()=>{
              const result = await deleteProject(data.project_id as string)
              if(result.status) {
                toast({
                  title: TOAST_SUCCESS_TITLE,
                  description: "Project deleted successfully",
                  variant: "default",
                });

                router.push('/',{scroll:true})
              
              } else {
                toast({
                  title: TOAST_ERROR_TITLE,
                  description: result.error,
                  variant: "destructive",
                });
              }
            }} className='bg-red-500 hover:bg-red-600'>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}