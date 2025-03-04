"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/auth"
import { profileSchema, ProfileSchema } from "@/app/_lib/schemas/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { updateProfile } from "@/app/_actions/user"
import { uploadImage } from "@/app/_actions/projects"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]


export default function EditProfilePage() {
  const router = useRouter()
    const user = useAtomValue(userAtom)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const {toast} = useToast()

      const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          username: user?.username,
          email:user?.email,
          bio: user?.bio,
          website: user?.website,
          twitter:user?.twitter
        },
        mode: "onChange",
      })

      const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
    
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "Error",
            description: "Image size must be less than 5MB",
            variant: "destructive",
          })
          return
        }
    
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast({
            title: "Error",
            description: "Please upload a valid image file (JPEG, PNG, or GIF)",
            variant: "destructive",
          })
          return
        }
    
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

    const clearImagePreview = () => {
        setPreviewImage(null)
        const fileInput = document.getElementById("profile-image") as HTMLInputElement
        if (fileInput) fileInput.value = ""
    }

    async function onSubmit(data: ProfileSchema) {
      let toBeSent: Partial<ProfileSchema>&{image_url?:string} = data
      const fileInput = document.getElementById("profile-image") as HTMLInputElement
      if (fileInput?.files?.[0] && !user?.image_url) {
        const result = await uploadImage(fileInput.files[0])
        if(!result.status){
          toast({
            title: TOAST_ERROR_TITLE,
            description: result.error,
            variant: "destructive",
          });
        }
        if(result.url){
          toBeSent['image_url'] = result.url
        }
      }
      // Call the server action
      const result = await updateProfile(toBeSent)

      if (!result.status) {
        toast({
          title: TOAST_ERROR_TITLE,
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Your profile has been updated successfully",
      })
    }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gray-50">
      {/* Header */}
      <div className="text-mainColor">
        <div className="container mx-auto px-4 py-6">
            <Link href="/settings/profile" className="text-mainColor flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Edit Profile</h1>
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
            <CardDescription>
              Update your profile information and customize how others see you on the platform.
            </CardDescription>
          </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <FormItem>
              <FormLabel className="font-semibold">Profile Picture</FormLabel>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-accentColor">
                    <AvatarImage src={previewImage || "/placeholder.svg?height=128&width=128"} alt="Profile preview" />
                    <AvatarFallback className="bg-secondaryColor text-white text-xl">
                        {user?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={clearImagePreview}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      aria-label="Remove image preview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profile-image")?.click()}
                      className="bg-white border-accentColor text-accentColor hover:bg-white hover:text-accentColor"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Picture
                    </Button>
                  </div>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <FormDescription>Recommended: Square image, at least 400x400px. Max 2MB.</FormDescription>
                </div>
              </div>
            </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Username:</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email:</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Twitter:</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {/* Website */}
                <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Website:</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-3">
                        <FormLabel className="font-semibold">Bio:</FormLabel>
                        <span className="text-xs text-gray-500">{form.watch("bio").length}/500 characters</span>
                    </div>
                    <FormControl>
                      <Textarea rows={5} placeholder="Tell others about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/settings/profile")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-secondaryColor hover:bg-secondaryColor" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
        </Card>
      </div>
    </div>
  )
}
