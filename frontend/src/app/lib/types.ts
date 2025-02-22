export interface BasicsFormData {
    project_img: string | null;
    title: string;
    description: string;
    categories: string[];
  }
  
  export interface FundingFormData {
    funding_goal: number;
    deadline: string;
  }
  
  export interface StoryFormData {
    campaign: string
  }