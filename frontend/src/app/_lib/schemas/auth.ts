import {z} from "zod"

export const formSchema = z.object({
  username: z.string().min(2, {
    message: "* Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "* Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "* Password must be at least 8 characters.",
  }).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,{message:"* Password must include at least one uppercase letter, one lowercase letter, one number and one special character"}),
  terms: z.boolean().refine((val) => val === true, {
    message: "* You must accept the terms and conditions.",
  }),
})

export const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean().optional(),
})

export type FormSchema = z.infer<typeof formSchema>
export type LoginFormSchema = z.infer<typeof loginFormSchema>