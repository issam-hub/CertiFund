import {z} from "zod"

export const createProjectSchema = z.object({
    title: z.string({required_error:"Title must be provided", invalid_type_error:"Title must be a string"}),
    description:z.string({required_error:"Description must be provided", invalid_type_error:"Description must be a string"}),
    categories: z.array(z.string({invalid_type_error:"Each category must be a string"}),{required_error:"Categories must be provided", invalid_type_error:"Categories must be an array"}),
    funding_goal: z.number({required_error:"Funding goal must be provided", invalid_type_error:"Funding goal must be a number"}).positive({message:"Funding goal must be a positive number"}),
    deadline: z.string({required_error:"Deadline must be provided", invalid_type_error:"Deadline must be a date"})
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>&{creator_id: string}
export type UpdateProjectSchema = z.infer<typeof createProjectSchema>&{project_id?:string, project_img?:string, campaign?:string, status?:string, current_funding:number, creator_id:string}

export const backProjectSchema = z.object({
    amount: z.number({required_error: "* Amount must be provided", invalid_type_error:"* Amount must be a number"}),
})

export type BackProjectSchema = z.infer<typeof backProjectSchema>;

export const refundSchema = z.object({
    reason: z.string().max(500, "Reason cannot exceed 500 characters").optional()
})

export type RefundSchema = z.infer<typeof refundSchema>;

export const rewardsSchema = z.object({
    rewards: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        amount: z.coerce.number().min(1, "Price must be at least 1"),
        description: z.string().min(1, "Description is required"),
        image_url: z.string().optional(),
        includes: z.array(z.string().min(1, "Includes is required")),
        estimated_delivery: z.date().or(z.string()),
    }))
})

export type RewardsSchema = z.infer<typeof rewardsSchema>;

export const updateSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
    content: z
      .string()
      .min(20, "Content must be at least 20 characters")
      .max(5000, "Content must be less than 5000 characters"),
  })
  
export type UpdateSchema = z.infer<typeof updateSchema>

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long (max 1000 characters)"),
})

export type Commentschema = z.infer<typeof commentSchema>

export const reportFormSchema = z.object({
  type: z.string({
    required_error: "Please select a report type",
  }).refine(value => value !== "", {
    message: "Please select a report type",
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  evidences: z.array(z.string()).optional(),
  context: z.enum(["project", "user", "comment"], {
    required_error: "Please select a context",
    invalid_type_error: "Context must be either project, user or comment"
  }),
})

export type ReportFormSchema = z.infer<typeof reportFormSchema>

export const resolveFormSchema = z.object({
  status: z.enum(["resolved", "rejected"], {
    required_error: "Please select a status",
    invalid_type_error: "Status must be either resolved or rejected"
  }),
  note: z.string()
  .min(10, "Note must be at least 10 characters")
  .max(500, "Note must be less than 500 characters")
})

export type ResolveFormSchema = z.infer<typeof resolveFormSchema>

export const reviewFormSchema = z.object({
  status: z.enum(["Approved", "Rejected"], {
    required_error: "Please select your decision",
    invalid_type_error: "Decision must be either approve or reject",
  }),
  feedback: z.string()
  .min(10, "Feedback must be at least 10 characters")
  .max(500, "Feedback must be less than 500 characters")
})

export type ReviewFormSchema = z.infer<typeof reviewFormSchema>