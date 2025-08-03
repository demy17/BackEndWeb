import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  User,
  Stethoscope,
  ClipboardList,
  User2,
  Edit,
  Save,
  AlertCircle,
  Shield,
  Calendar,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { getUserbyId } from "../functions/userFunctions";
import { toast } from "sonner";
import { MainLayout } from "../layout/MainLayout";
import { useState } from "react";
import useUser from "../services/hooks/useUser";

export const UserProfile = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();

  // Use currentUser if viewing own profile
  const isOwnProfile =
    currentUser && (currentUser.refId === id || currentUser._id === id);

  const {
    data: nUser,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserbyId(id),
    retry: 2,
    retryDelay: 1000,
    enabled: !!id && !isOwnProfile, // Only fetch if not own profile
    onError: (error) => {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user profile");
    },
  });

  // Use currentUser if it's own profile, otherwise use fetched user
  const user = isOwnProfile ? currentUser : nUser;

  const handleRetry = () => {
    refetch();
  };

  const handleSaveChanges = () => {
    // Add save functionality here
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto py-8 max-w-4xl px-4">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b pb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-2 text-center md:text-left">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
          <div className="container mx-auto py-8 max-w-4xl px-4">
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Error Loading Profile
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      {error?.message ||
                        "We couldn't load the user profile. Please try again."}
                    </p>
                    {!id && (
                      <p className="text-sm text-red-600">
                        User ID is missing from the URL
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRetry}>
                      Try Again
                    </Button>
                    <Button onClick={() => window.history.back()}>
                      Go Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
          <div className="container mx-auto py-8 max-w-4xl px-4">
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      User Not Found
                    </h3>
                    <p className="text-gray-600">
                      The user profile you're looking for doesn't exist.
                    </p>
                  </div>
                  <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  const userRole = user.roles?.[0] || "user";
  const isDoctor = user.roles?.includes("doctor");
  const isPatient = user.roles?.includes("patient");

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto py-8 max-w-4xl px-4">
          <Card className="shadow-lg border-0 overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 pb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={user?.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 capitalize"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {userRole}
                    </Badge>
                    {user.specialization && (
                      <Badge
                        variant="outline"
                        className="bg-white/10 text-white border-white/30"
                      >
                        <Stethoscope className="h-3 w-3 mr-1" />
                        {user.specialization}
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm">
                    Member since{" "}
                    {format(
                      new Date(user.createdAt || Date.now()),
                      "MMMM yyyy"
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 border-b">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(
                      (new Date() - new Date(user.dateOfBirth)) /
                        (1000 * 60 * 60 * 24 * 365)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Years Old</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.emailConfirmed ? "Verified" : "Pending"}
                  </p>
                  <p className="text-sm text-gray-600">Email Status</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                  <p className="text-sm text-gray-600">Account Status</p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="p-6 space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Personal Information
                      </h2>
                    </div>

                    <div className="space-y-4 pl-13">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>
                        {user.emailConfirmed && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {user.phoneNumber || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(user.dateOfBirth), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900">
                            {user.address || "Address not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional/Medical Information */}
                  {isDoctor && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Professional Information
                        </h2>
                      </div>

                      <div className="space-y-4 pl-13">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Specialization
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.specialization}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            License Number
                          </p>

                          <p className="font-medium text-gray-900">
                            {user.licenseNumber || "Not provided"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Years of Experience
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.yearsOfExperience || "Not specified"} years
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Department
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.department || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isPatient && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Medical Information
                        </h2>
                      </div>

                      <div className="space-y-4 pl-13">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Blood Type
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.bloodType || "Not specified"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Allergies
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.allergies?.length > 0
                              ? user.allergies.join(", ")
                              : "None reported"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Insurance Provider
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.insuranceProvider || "None"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Policy Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.insurancePolicyNumber || "None"}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Emergency Contact
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.emergencyContact || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Security */}
                <div className="border-t pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Account Security
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Verification
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.emailConfirmed
                              ? "Your email is verified"
                              : "Email not verified"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.emailConfirmed ? "default" : "secondary"
                          }
                        >
                          {user.emailConfirmed ? "Verified" : "Pending"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Phone Verification
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.phoneNumberConfirmed
                              ? "Your phone is verified"
                              : "Phone not verified"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.phoneNumberConfirmed ? "default" : "secondary"
                          }
                        >
                          {user.phoneNumberConfirmed ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.twoFactorEnabled
                              ? "2FA is enabled"
                              : "2FA is disabled"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.twoFactorEnabled ? "default" : "outline"
                          }
                        >
                          {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Account Status
                          </p>
                          <p className="text-sm text-gray-600">
                            Your account is active
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t bg-gray-50 p-6">
              <div className="text-sm text-gray-600">
                Last updated:{" "}
                {format(
                  new Date(user.updatedAt || user.createdAt || Date.now()),
                  "PPP 'at' p"
                )}
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
