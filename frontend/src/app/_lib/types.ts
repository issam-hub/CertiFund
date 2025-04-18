import { UpdateProjectSchema } from "./schemas/project";

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
  user_id: string;
  email: string;
  username: string;
  role: string;
  image_url:string;
  created_at:string;
  bio:string;
  website:string;
  twitter:string;
  updated_at: string
  projects_created: number
  projects_backed: number
  total_contributed: number
  activated: boolean
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

export interface Overview {
  project_month: string,
  successful_projects: number,
  failed_projects: number,
  total_projects: number,
}

export interface Project {
  project_id: number
  title: string
  description: string
  funding_goal: number
  current_funding: number
  categories: string[]
  deadline: string
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Live' | 'Completed'
  project_img: string
  campaign: string
  launched_at: string
  created_at: string
  updated_at: string
  backers: number
  version: number
  creator: string
  creator_img: string
  is_suspicious: boolean
}

export interface Metadata {
  current_page: number
  page_size: number
  first_page: number
  last_page: number
  total_records: number
}

export type ProjectStatus = 'draft' | 'pending review' | 'approved' | 'rejected' | 'live' | 'completed'

export type Backing = {
  backing_id: string
  payment_id: number
  backer: string
  project: string
  project_id: number
  amount: number
  status: "pending" | "completed" | "refunded"
  created_at: string
  updated_at: string
  payment_method: string
  transaction_id: string
}

export type FileWithUrl = {
  file: File;
  url: string | null;
  isUploading: boolean;
}

export type DisputeStatus = "pending" | "under review" | "resolved" | "rejected" | "cancelled"

export type Dispute = {
  dispute_id: string
  status: DisputeStatus
  type: string
  description: string
  evidences?: string[]
  created_at: string
  updated_at: string
  resolved_at: string | null
  reporter: string
  context: string
  reported_resource: string
}

export type ProfileType = {
  createdProjects: UpdateProjectSchema[]
  user?: User
  savedProjects?: UpdateProjectSchema[]
  backedProjects: UpdateProjectSchema[]
  stats:{
    created_projects:number
    backed_projects:number
}
}