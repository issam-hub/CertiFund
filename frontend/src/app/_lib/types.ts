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

export interface Reward {
  id: number;
  title: string;
  description: string;
  amount: number;
  includes: string[];
  estimated_delivery: string;
  image_url: string;
}

export interface Update {
  id: number,
  title: string,
  content: string,
  created_at: string
}

export interface Comment {
  id: number
  content: string
  username: string
  image_url: string
  created_at: string
  path: string
  level?: number
  replies?: Comment[]
}