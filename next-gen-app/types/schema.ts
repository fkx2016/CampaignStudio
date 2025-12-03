import { z } from "zod";

// 1. Define the Schema for a Campaign Post
// This acts as the "Contract" for our frontend data.
export const CampaignPostSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    hook_text: z.string().min(1, "Hook text is required"),
    category_primary: z.string(),
    category_secondary: z.string().optional(),
    category_tertiary: z.string().optional(),
    status: z.enum(["Pending", "Posted"]),
    posted_date: z.string().optional(),

    // Media
    meme_detail_expl: z.string().optional(),
    source_url: z.string().optional(),
    media_image_url: z.string().optional(),
    media_video_url: z.string().optional(),
    closing_hook: z.string().optional(),

    // Metadata
    kc_approval: z.string().optional(),
    target_platforms: z.array(z.string()).optional(),
    platform_post_ids: z.array(z.record(z.string(), z.any())).optional(),
    performance_metrics: z.record(z.string(), z.any()).optional(),

    // AI Prompts
    image_prompt: z.string().optional(),
    video_prompt: z.string().optional(),

    // Relationships
    campaign_id: z.number().optional(),
    mode: z.string().optional(),
});

// 2. Export the Type derived from the Schema
// This replaces the manual interface definition.
export type CampaignPost = z.infer<typeof CampaignPostSchema>;

export const CampaignSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    description: z.string().optional(),
    status: z.string().optional(),
    mode_id: z.number().optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const ModeSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
});

export type Mode = z.infer<typeof ModeSchema>;

export const PlatformSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    slug: z.string(),
    base_url: z.string(),
    char_limit: z.number(),
    is_active: z.boolean().optional(),
    default_hashtags: z.string().optional(),
    post_suffix: z.string().optional(),
});

export type Platform = z.infer<typeof PlatformSchema>;
