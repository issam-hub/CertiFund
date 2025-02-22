import React from 'react';

type Step = {
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
};

type StepIndicatorProps = {
  currentStep: number;
  errors: any
};

export default function StepIndicator({ currentStep, errors }: StepIndicatorProps) {
  const steps: Step[] = [
    {
      number: 1,
      title: "Basic Info",
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      number: 2,
      title: "Funding Details",
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
  ];

  return (
    <div className="w-full mb-12">
      <div className="relative flex items-center">
        {/* Steps container */}
        <div className="absolute w-full flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step.isActive || step.isCompleted
                    ? "bg-secondaryColor text-white"
                    : "bg-gray-200 text-gray-600"
                } ${
                  (errors.title || errors.description || errors.categories) && step.number == 1 && "bg-red-special"
                } ${
                  (errors.funding_goal || errors.deadline) && step.number == 2 && "bg-red-special"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`mt-2 text-sm ${
                  step.isActive || step.isCompleted
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
        
        {/* Separator line */}
        <div className="w-[calc(100%_-_200px)] mx-auto h-[2px] bg-gray-200">
          <div
            className="h-full bg-secondaryColor transition-all duration-300"
            style={{ width: currentStep > 1 ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}