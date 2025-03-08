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
  campaign: string;
}

export type User = {
  id: string;
  email: string;
  username: string;
  role: string;
  image_url:string;
  created_at:string;
  bio:string;
  website:string;
  twitter:string;
};

export interface ProjectsFilters {
  page?:string
  search?:string
  categories?: string[]
  limit?:string
  sort?:string
}