import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Client, RawClientData } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Client data mapping utilities
export function mapClientData(rawClient: RawClientData | null | undefined): Client | null {
  // Check if rawClient is null, undefined, or missing required properties
  if (!rawClient || typeof rawClient !== 'object' || !rawClient._id || !rawClient.user) {
    console.warn("Invalid client data:", rawClient);
    return null;
  }

  try {
    return {
      _id: rawClient._id,
      VCTSID: rawClient.VCTSID || "",
      IRDID: rawClient.IRDID || "",
      OCRID: rawClient.OCRID || "",
      companyName: rawClient.companyName || "",
      registrationNumber: rawClient.registrationNumber || "",
      status: (rawClient.status === "active" ? "active" : "inactive") as "active" | "inactive",
      assignedEmployees: rawClient.assignedEmployees || [],
      createdAt: rawClient.createdAt || "",
      updatedAt: rawClient.updatedAt || "",
      __v: rawClient.__v || 0,
      user: {
        _id: rawClient.user?._id || "",
        fullName: rawClient.user?.fullName || "",
        email: rawClient.user?.email || "",
        phoneNumber: rawClient.user?.phoneNumber || "",
        address: rawClient.user?.address || "",
        DOB: rawClient.user?.DOB || "",
        role: rawClient.user?.role || "",
        profileImageId: rawClient.user?.profileImageId ?
          {
            _id: "",
            filename: "",
            originalName: "",
            mimetype: "",
            size: 0,
            url: rawClient.user.profileImageId,
            description: "",
          } :
          null,
      },
    };
  } catch (error) {
    console.error("Error mapping client data:", error, rawClient);
    return null;
  }
}

export function formatClientForDisplay(client: Client) {
  return {
    id: client._id,
    vctsId: client.VCTSID,
    irdId: client.IRDID,
    ocrId: client.OCRID,
    company: client.companyName,
    registration: client.registrationNumber,
    contactPerson: client.user?.fullName,
    email: client.user?.email,
    phoneNumber: client.user?.phoneNumber,
    address: client.user?.address,
    status: client.status,
    assignedCount: client.assignedEmployees.length,
    createdDate: new Date(client.createdAt).toLocaleDateString(),
    updatedDate: new Date(client.updatedAt).toLocaleDateString(),
  }
}
