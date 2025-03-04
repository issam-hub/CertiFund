"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Eye, EyeOff, Key, Lock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { passwordChangeSchema, PasswordChangeSchema } from "@/app/_lib/schemas/auth"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { changePassword } from "@/app/_actions/user"


export function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const accountForm = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues:{
        old_password:"",
        new_password:"",
        confirm_password:""
    }
  })

  async function onSubmitAccount(data: PasswordChangeSchema) {
        const result = await changePassword(data)

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
        description: "Your password has been updated successfully",
        })
        router.push("/login",{scroll:true})
        router.refresh()
  }

  async function handleDeleteAccount() {
    // try {
    //   setIsDeleting(true)
    //   const result = await deleteAccount()

    //   if (result.error) {
    //     toast({
    //       title: "Error",
    //       description: result.error,
    //       variant: "destructive",
    //     })
    //     return
    //   }

    //   toast({
    //     title: "Account Deleted",
    //     description: "Your account has been permanently deleted",
    //   })

    //   router.push("/signup")
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete account. Please try again.",
    //     variant: "destructive",
    //   })
    // } finally {
    //   setIsDeleting(false)
    // }
  }

  return (
    <div className="container mx-auto mt-5 my-5">
        <div className="space-y-6 max-w-3xl mx-auto">
        <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-10 px-1.5">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
            <Card>
                <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your account settings and change your password</CardDescription>
                </CardHeader>
                <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onSubmitAccount)}>
                    <CardContent className="space-y-6">
                    {/* Current Password */}
                    <FormField
                        control={accountForm.control}
                        name="old_password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Current Password:</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Key className="w-4 h-4 text-gray-500" />
                                    <div className="relative w-full">
                                        <Input type={showPassword ? "text":`password`} {...field} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={`absolute top-1/2 -translate-y-1/2 h-fit p-0 hover:bg-transparent right-5`}
                                            onClick={() => setShowPassword(!showPassword)}
                                            >
                                            {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* New Password */}
                    <FormField
                        control={accountForm.control}
                        name="new_password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">New Password:</FormLabel>
                            <FormControl>
                            <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-gray-500" />
                                <div className="relative w-full">
                                    <Input {...field} type={showNewPassword ? "text":`password`} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={`absolute top-1/2 -translate-y-1/2 h-fit p-0 hover:bg-transparent right-5`}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                        {showNewPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            </FormControl>
                            <FormDescription>Leave blank to keep your current password</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* Confirm Password */}
                    <FormField
                        control={accountForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Confirm New Password:</FormLabel>
                            <FormControl>
                            <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-gray-500" />
                                <div className="relative w-full">
                                    <Input {...field} type={showConfirmPassword ? "text":`password`} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={`absolute top-1/2 -translate-y-1/2 h-fit p-0 hover:bg-transparent right-5`}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                        {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button
                        type="submit"
                        className="bg-[#3B82F6] hover:bg-[#1E3A8A]"
                        disabled={!accountForm.formState.isDirty || accountForm.formState.isSubmitting}
                    >
                        {accountForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>

            {/* Delete Account */}
            <Card className="mt-6 border-destructive">
                <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all of your data</CardDescription>
                </CardHeader>
                <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all of your
                        data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                        >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </CardContent>
            </Card>
            </TabsContent>

            {/* Notification Settings */}
            {/* <TabsContent value="notifications">
            <Card>
                <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)}>
                    <CardContent className="space-y-6">
                    <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>Receive notifications via email</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={notificationForm.control}
                        name="projectUpdates"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Project Updates</FormLabel>
                            <FormDescription>Get notified about updates on projects you've backed</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={notificationForm.control}
                        name="newFollowers"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">New Followers</FormLabel>
                            <FormDescription>Get notified when someone follows you</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={notificationForm.control}
                        name="mentions"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Mentions</FormLabel>
                            <FormDescription>Get notified when someone mentions you</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={notificationForm.control}
                        name="newsletter"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Newsletter</FormLabel>
                            <FormDescription>Receive our monthly newsletter</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button
                        type="submit"
                        className="bg-[#3B82F6] hover:bg-[#1E3A8A]"
                        disabled={!notificationForm.formState.isDirty || notificationForm.formState.isSubmitting}
                    >
                        {notificationForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
            </TabsContent> */}

            {/* Privacy Settings */}
            {/* <TabsContent value="privacy">
            <Card>
                <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                    Manage your privacy preferences and control who can see your information
                </CardDescription>
                </CardHeader>
                <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)}>
                    <CardContent className="space-y-6">
                    <FormField
                        control={privacyForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Public Profile</FormLabel>
                            <FormDescription>Make your profile visible to everyone</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={privacyForm.control}
                        name="showEmail"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Email</FormLabel>
                            <FormDescription>Display your email address on your public profile</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={privacyForm.control}
                        name="showLocation"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Location</FormLabel>
                            <FormDescription>Display your location on your public profile</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={privacyForm.control}
                        name="allowMessages"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Messages</FormLabel>
                            <FormDescription>Let other users send you direct messages</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button
                        type="submit"
                        className="bg-[#3B82F6] hover:bg-[#1E3A8A]"
                        disabled={!privacyForm.formState.isDirty || privacyForm.formState.isSubmitting}
                    >
                        {privacyForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
            </TabsContent> */}

            {/* Connected Accounts */}
            {/* <TabsContent value="connections"> */}
            {/* <Card>
                <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your connected accounts and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6"> */}
                {/* Social Connections */}
                {/* <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Accounts</h3>
                    <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                        <Github className="w-6 h-6" />
                        <div>
                            <p className="font-medium">GitHub</p>
                            <p className="text-sm text-gray-500">Not connected</p>
                        </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                        <Twitter className="w-6 h-6" />
                        <div>
                            <p className="font-medium">Twitter</p>
                            <p className="text-sm text-gray-500">@jane_doe</p>
                        </div>
                        </div>
                        <Button variant="outline">Disconnect</Button>
                    </div>
                    </div>
                </div> */}

                {/* Payment Methods */}
                {/* <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Methods</h3>
                    <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                        <CreditCard className="w-6 h-6" />
                        <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500">Expires 12/24</p>
                        </div>
                        </div>
                        <Button variant="outline">Remove</Button>
                    </div>
                    <Button className="bg-[#3B82F6] hover:bg-[#1E3A8A]">Add Payment Method</Button>
                    </div>
                </div>
                </CardContent>
            </Card>
            </TabsContent> */}
        </Tabs>
        </div>
    </div>
  )
}

