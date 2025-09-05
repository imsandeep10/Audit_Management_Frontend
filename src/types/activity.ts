import { z } from "zod";

// User schema based on your API response
export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(["employee", "admin", "client"]),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  DOB: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  timestamp: z.string()

});

// Activity Resource Schema (unchanged)
export const ActivityResourceSchema = z.object({
  resourceType: z.enum(["document", "admin", "client", "employee", "user", "auth", "files", "system"]),
  resourceId: z.string().optional(),
  resourceName: z.string().optional(),
});

// Activity Metadata Schema (unchanged)
export const ActivityMetadataSchema = z.object({
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.string().optional(),
  deviceInfo: z.string().optional(),
  additionalData: z.record(z.string(), z.unknown()).optional(),
});

// Main Activity Schema (updated)
export const ActivitySchema = z.object({
  _id: z.string(),
  userId: UserSchema,
  userRole: z.enum(["employee", "admin", "client"]),
  action: z.string(),
  actionDescription: z.string(),
  targetResource: ActivityResourceSchema,
  metadata: ActivityMetadataSchema,
  status: z.enum(["success", "failed", "pending", "locked", "error"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  __v: z.number().optional() // Added based on your response
});

// Paginated Response Schema
export const PaginatedActivitySchema = z.object({
  docs: z.array(ActivitySchema),
  totalDocs: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  page: z.number(),
  pagingCounter: z.number(),
  hasPrevPage: z.boolean(),
  hasNextPage: z.boolean(),
  prevPage: z.number().nullable(),
  nextPage: z.number().nullable()
});

export const ActivityApiResponseSchema = z.object({
  success: z.boolean(),
  data: PaginatedActivitySchema,
  period: z.string(),
  userId: z.string(),
});

// TypeScript Types
export type User = z.infer<typeof UserSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type PaginatedActivity = z.infer<typeof PaginatedActivitySchema>;
export type ActivityApiResponse = z.infer<typeof ActivityApiResponseSchema>;