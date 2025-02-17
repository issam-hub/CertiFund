"use client"
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { UpdateProjectSchema } from '@/lib/schemas/project';
import ProjectForm from '@/components/projectForm';

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

export default function ProjectOverview({ data }: ProjectOverviewProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string>("");

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  const markStepAsCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleAgreeToRules = () => {
    markStepAsCompleted("rules");
    setExpandedStep("");
  };

  const TimelineStep = ({ 
    stepId, 
    title,
    stepNumber,
    children 
  }: { 
    stepId: string; 
    title: string;
    stepNumber: string;
    children?: React.ReactNode;
  }) => (
    <div className="flex gap-8 max-lg:gap-3 relative">
      {/* Timeline circle and line container */}
      <div className="relative flex items-center justify-center w-8">
        {/* Vertical line */}
        { (
          <div className="absolute w-0.5 bg-secondaryColor top-0 bottom-0 left-1/2 -translate-x-1/2" />
        )}
        {/* Circle */}
        <div className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background text-secondaryColor z-10 relative -translate-y-4",
          isStepCompleted(stepId) ? "border-secondaryColor bg-secondaryColor text-white" : "border-secondaryColor"
        )}>
          {isStepCompleted(stepId) ? <Check className="w-5 h-5" /> : stepNumber}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[60px] pb-8">
        <div className="border rounded-lg overflow-hidden">
          <div 
            className={cn(
              "p-4 cursor-pointer flex items-center gap-4 bg-background hover:bg-accent transition-colors",
              isStepCompleted(stepId) && "border-l-4 border-l-primary"
            )}
            onClick={() => setExpandedStep(expandedStep === stepId ? "" : stepId)}
          >
            <h3 className="font-semibold">{title}</h3>
          </div>
          {expandedStep === stepId && (
            <div className="p-4 border-t bg-background/50">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-[80%] max-lg:max-w-full max-lg:px-2">
      <h1 className="text-3xl font-bold text-center mb-12">{data.title}</h1>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Rules</h2>
        <TimelineStep stepId="rules" title="Project Rules" stepNumber="1">
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
        </TimelineStep>
      </div>

      <div>
        <h2 className="text-2xl mb-4">Project Details</h2>
        
        <TimelineStep stepId="basics" title="Project Basics" stepNumber="2">
          {expandedStep === "basics" && (
            <ProjectForm data={data} activeTab="basics" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep stepId="funding" title="Funding Details" stepNumber="3">
          {expandedStep === "funding" && (
            <ProjectForm data={data} activeTab="funding" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep stepId="story" title="Story" stepNumber="4">
          {expandedStep === "story" && (
            <ProjectForm data={data} activeTab="story" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>

        <TimelineStep 
          stepId="rewards" 
          title="Rewards" 
          stepNumber="5" 
        >
          {expandedStep === "rewards" && (
            <ProjectForm data={data} activeTab="rewards" onStepComplete={(stepId) => {
              markStepAsCompleted(stepId);
              setExpandedStep("");
            }} />
          )}
        </TimelineStep>
      </div>
    </div>
  );
}