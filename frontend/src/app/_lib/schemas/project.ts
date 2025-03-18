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
