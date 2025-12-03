// 🛡️ WORKSTATION SAFETY CHECK
// 1. Inputs Validated? [YES - via Zod]
// 2. Return Types Explicit? [YES]
// 3. Nulls Handled? [YES]

import { z } from 'zod';

// 1. Define the Status Enum explicitly
export const ProjectStatusSchema = z.enum([
    'active',
    'archived',
    'maintenance',
    'draft'
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// 2. Define strict Metadata (no loose records)
export const ProjectMetadataSchema = z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    version: z.number().int().positive(),
    tags: z.array(z.string()).readonly() // Readonly to prevent mutation bugs
});
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

// 3. The Core Project State
export const ProjectStateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Project name cannot be empty"),
    status: ProjectStatusSchema,
    metadata: ProjectMetadataSchema,
    // Using 'unknown' for flexible payload to force type narrowing later, NEVER 'any'
    payload: z.unknown()
});
export type ProjectState = z.infer<typeof ProjectStateSchema>;

console.log("✅ Strict Types Loaded Successfully");
