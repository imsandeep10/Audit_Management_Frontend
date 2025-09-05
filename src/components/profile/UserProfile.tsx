import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export function Profile() {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6  overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/Dashboard">
            <span>Home</span>
            <span className="mx-2">›</span>
          </Link>
          <Link to="/profile">
            <span className="font-semibold text-black">Profile</span>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={user?.profileImageId?.url}
                  alt={user?.fullName}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(user?.fullName || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-muted-foreground capitalize">
                  {user?.role || "No role specified"}
                </p>
                {user?.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {user.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between ">
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Phone:
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {user?.phoneNumber || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email:
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email || "Not specified"}
              </p>
            </div>
            <div>
              {user?.address && (
                <>
                  <p className="text-sm font-medium text-muted-foreground">
                    Address:
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {user.address}
                  </p>
                </>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DOB:</p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {user?.DOB ? formatDate(user.DOB) : "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
