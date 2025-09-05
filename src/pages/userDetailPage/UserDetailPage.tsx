import { Cake, IdCardLanyard, Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetUserById } from "../../api/useUser";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import CopyComponent from "../../components/CopyComponent";
import EyeComponent from "../../components/EyeComponent";
import TasksTable from "./userTaskTable";

const UserDetailPage = () => {
  const { userId } = useParams();
  const { data, isLoading, error } = useGetUserById(userId || "");
console.log(data)
  const navigate = useNavigate();
  const { clientId } = useLocation().state || {};

  if (!userId) {
    return <p>User Not Found</p>;
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error) return <p>Error loading client data...</p>;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6 max-h-screen overflow-y-auto">
        <Card>
          <CardContent className="">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="rounded-lg">
                  <AvatarImage
                    src={data?.user?.profileImageId?.url}
                    alt="Image"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {data?.user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold">
                    {data?.user?.fullName}
                  </h2>
                  <p className="text-md text-gray-500 text-wrap">
                    {data?.user?.client?.companyName || "No Company Name"}
                  </p>
                </div>
              </div>
             
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <Link
                      to={`${import.meta.env.VITE_WHATSAPP_URL}${data?.user?.phoneNumber
                        }`}
                    >
                      <FaWhatsapp size={24} className="text-green-600" />
                    </Link>
                  </div>
                  {data.user.client && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate(`/clients/${clientId}/documents`, {
                          state: {
                            clientId: clientId,
                            userName: data.user.fullName,
                            companyName: data.user.client.companyName,
                          },
                        });
                      }}
                      className="block gap-2"
                    >
                      View Documents
                    </Button>
                  )}

                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-7xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <h3 className="text-2xl font-semibold"> Information</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 space-y-3 ">
              <div className="flex gap-5 items-center">
                <p>
                  <Phone className="w-4 h-4" />
                </p>
                <p className="text-xl  ">Phone: {data?.user?.phoneNumber}</p>
              </div>

              <div className="flex gap-5 items-center">
                <p>
                  <Mail className="w-4 h-4" />
                </p>
                <p className="text-xl ">Email: {data.user.email}</p>
              </div>
              <div className="flex gap-5 items-center">
                <p>
                  <MapPin className="w-4 h-4" />
                </p>
                <p className="text-xl ">Address: {data.user.address}</p>
              </div>

              <div className="flex gap-5 items-center">
                <p>
                  <Cake className="w-4 h-4" />
                </p>
                <p className="text-xl ">DOB: {data.user.DOB ? data.user.DOB.split('T')[0] : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        {data?.user?.client && (
          <Card className="max-w-7xl mb-10 lg:mb-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="text-lg font-semibold">
                {" "}
                Government Offices Information
              </h3>
            </CardHeader>
            <CardContent className="flex flex-row justify-between items-center space-y-3 ">
              <div className="space-y-3">
                <div className="flex gap-5 items-center">
                  <p className="flex items-center gap-2">
                    <IdCardLanyard className="w-4 h-4" />
                  </p>
                  <p className="text-xl ">
                    VCTSID: {data?.user?.client?.VCTSID}
                  </p>
                  <p>
                    <CopyComponent text={data?.user?.client?.VCTSID} />
                  </p>
                </div>
                <div className="flex gap-5 items-center">
                  <p className="flex items-center gap-2">
                    <IdCardLanyard className="w-4 h-4" />
                  </p>

                  <p className="text-xl ">
                    IRDID : {data?.user?.client?.IRDID}
                  </p>
                  <p>
                    <CopyComponent text={data?.user?.client?.IRDID} />
                  </p>
                </div>
                <div className="flex gap-5 items-center">
                  <p className="flex items-center gap-2">
                    <IdCardLanyard className="w-4 h-4" />
                  </p>
                  <p className="text-xl ">
                    OCRID : {data?.user?.client?.OCRID}
                  </p>
                  <p>
                    <CopyComponent text={data?.user?.client?.OCRID} />
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-5 items-center">
                  <EyeComponent text={data?.user?.client?.vctsPassword} />
                  <CopyComponent text={data?.user?.client?.vctsPassword} />
                </div>

                <div className="flex gap-5 items-center">
                  <EyeComponent text={data?.user?.client?.irdPassword} />
                  <CopyComponent text={data?.user?.client?.irdPassword} />
                </div>

                <div className="flex gap-5 items-center">
                  <EyeComponent text={data?.user?.client?.ocrPassword} />
                  <CopyComponent text={data?.user?.client?.ocrPassword} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee document view section */}
        {data?.user?.employee && (
          <Card className="max-w-7xl mb-10 lg:mb-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="text-lg font-semibold">Employee Documents</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Document Type */}
                <div className="flex items-center gap-4">
                  <span className="font-medium">Document Type:</span>
                  <Badge variant="outline">
                    {data.user.employee.documentType
                      ? data.user.employee.documentType
                        .charAt(0)
                        .toUpperCase() +
                      data.user.employee.documentType.slice(1)
                      : "Not specified"}
                  </Badge>
                </div>

                {/* Document Image */}
                <div className="space-y-2">
                  <span className="font-medium">Document Image:</span>
                  {data.user.employee.documentImageId?.url ? (
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      <img
                        src={data.user.employee.documentImageId.url}
                        alt={`${data.user.fullName}'s ${data.user.employee.documentType || "document"
                          }`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No document uploaded
                    </div>
                  )}
                </div>
              </div>
        <TasksTable tasks={data.user.employee.assignedTasks} />
            </CardContent>
          </Card>
     

        )}
      </div>
    </>
  );
};

export default UserDetailPage;
