import {z} from "zod"

export const createProjectSchema = z.object({
    title: z.string({required_error:"Title must be provided", invalid_type_error:"Title must be a string"}),
    description:z.string({required_error:"Description must be provided", invalid_type_error:"Description must be a string"}),
    category: z.string({required_error:"Category must be provided", invalid_type_error:"Category must be a string"}),
    funding_goal: z.number({required_error:"Funding goal must be provided", invalid_type_error:"Funding goal must be a number"}).positive({message:"Funding goal must be a positive number"}),
    deadline: z.string({required_error:"Deadline must be provided", invalid_type_error:"Deadline must be a date"})
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>
export type UpdateProjectSchema = z.infer<typeof createProjectSchema>&{project_id?:string, project_img?:string, campaign?:string}