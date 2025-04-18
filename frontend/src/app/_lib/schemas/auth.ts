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

export const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  twitter: z.string().max(50, "Twitter handle cannot exceed 50 characters").optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>

export const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters").optional(),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.new_password && data.new_password !== data.confirm_password) {
        return false
      }
      return true
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )

export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>

export const createUserSchema = z.object({
  username: z.string().min(2, {
    message: "* Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "* Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "* Password must be at least 8 characters.",
  }).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,{message:"* Password must include at least one uppercase letter, one lowercase letter, one number and one special character"}),
  role: z.enum(["reviewer", "admin"], {
    required_error: "Please select a role",
    invalid_type_error: "Role must be either an Admin or a Reviewer"
  }),
})

export type CreateUserSchema = z.infer<typeof createUserSchema>