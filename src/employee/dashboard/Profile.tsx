import { Phone, Mail, MapPin, Calendar, FileText, Building, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

export function EmployeeProfile() {
  const { user } = useAuth();
  const hasEmployeeData = user && user.employee;
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-widest">Profile</h1>
      </div>

      <Card>
        <CardContent className="">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={user?.profileImageId?.url}
                  alt="Profile Picture"
                  loading="lazy"
                  className="object-cover"
                />
                <AvatarFallback className="text-lg">
                  {user?.fullName
                      ? user.fullName.split(" ").map((n) => n[0]).join("")
                      : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                <p className="text-muted-foreground">
                  {hasEmployeeData ? user?.employee?.position : "Employee"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
                  {user?.phoneNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email:
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Address:
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {user?.address}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Birthday:
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {(user?.DOB ?? "").split("T")[0]}
                </p>
              </div>
              {hasEmployeeData && user?.employee?.panNumber && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    PAN Number:
                  </p>
                  <p>{user?.employee?.panNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="text-lg font-semibold">Documents</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasEmployeeData && user?.employee?.documentType && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Document Type:
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {user?.employee?.documentType}
                  </p>
                </div>
              )}

              {hasEmployeeData && user?.employee?.documentImageId && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Document Image:
                  </p>
                  <img 
                    src={user?.employee?.documentImageId?.url} 
                    alt={user?.employee?.documentType || "Document"} 
                    className="w-full max-w-xs h-auto object-contain border rounded"
                  />
                </div>
              )}

              {(!hasEmployeeData || !user?.employee?.documentType) && (
                <p className="text-muted-foreground">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Clients Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="text-lg font-semibold">Assigned Clients</h3>
            </CardHeader>
            <CardContent>
              {hasEmployeeData && user?.employee?.assignedClients && user?.employee?.assignedClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.employee?.assignedClients.map((client, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      <div className="flex-shrink-0">
                        {client.user?.profileImageId ? (
                          <img 
                            src={client.user.profileImageId.url} 
                            alt={client.user.fullName} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {client.user?.fullName || "Unnamed Client"}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {client.companyName || "No company specified"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No clients assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}