'use client'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Shield, Mail, Phone, MapPin, Calendar, Clock, Globe } from "lucide-react"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"


export default function AdminProfilePage() {
  const admin = useAtomValue(userAtom)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1F2937] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-row-reverse justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin/profile/edit">
                <Button variant="outline" size="sm" className="text-[#1F2937] bg-white hover:bg-gray-100">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-red-500">
                <AvatarImage src={admin?.image_url} alt="Admin profile" />
                <AvatarFallback className="bg-red-700 text-white text-2xl">{admin?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{admin?.username}</h1>
                <Badge className="bg-red-600">Administrator</Badge>
              </div>

              <div className="text-gray-300 mb-2">{admin?.email}</div>

              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#93C5FD]" />
                  <span>Member since {admin?.created_at.split("-")[0]}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
                <Shield className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  As an administrator, you have elevated privileges on this platform. Please ensure you follow security
                  best practices and maintain confidentiality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {admin?.username}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {admin?.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Twitter</h3>
                    <p className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {admin?.twitter || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Website</h3>
                    <p className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {admin?.website || "N/A"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {admin?.role.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                <p className="text-gray-700">{admin?.bio || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Permissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="manage-users" checked disabled />
                    <label htmlFor="manage-users" className="text-sm text-gray-700">Manage Users</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="manage-users" checked disabled />
                    <label htmlFor="manage-users" className="text-sm text-gray-700">Create Users</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="manage-users" checked disabled />
                    <label htmlFor="manage-users" className="text-sm text-gray-700">Manage Projects</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="manage-users" checked disabled />
                    <label htmlFor="manage-users" className="text-sm text-gray-700">Manage Backings</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="manage-users" checked disabled />
                    <label htmlFor="manage-users" className="text-sm text-gray-700">Manage Disputes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="view-reports" checked disabled />
                    <label htmlFor="view-reports" className="text-sm text-gray-700">View Reports</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
