"use server";

import connectDB from "@/lib/db";
import SeoMetaData from "@/models/SeoMetaData";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const SeoMetaDataSchema = z.object({
  routeSlug: z.string().min(1, "Route slug required"),
  metaTitle: z.string().min(3, "Title too short").max(100),
  metaDescription: z.string().min(10, "Description too short").max(300),
  focusKeyword: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().optional().default(false),
});

export const updateSeoMetaDataAction = createSafeAction(
  {
    schema: SeoMetaDataSchema,
    roles: ["ADMIN", "CONTENT_MANAGER"],
    requireAuth: true,
  },
  async (data) => {
    await connectDB();
    const seo = await SeoMetaData.findOneAndUpdate(
      { routeSlug: data.routeSlug },
      { ...data },
      { upsert: true, new: true, runValidators: true }
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/content/seo");

    return JSON.parse(JSON.stringify(seo));
  }
);

export const getSeoMetaDataAction = createSafeAction(
  {
    schema: z.object({ routeSlug: z.string() }),
    roles: ["ANY"],
    requireAuth: false,
  },
  async ({ routeSlug }) => {
    await connectDB();
    const seo = await SeoMetaData.findOne({ routeSlug }).lean();
    return seo ? JSON.parse(JSON.stringify(seo)) : null;
  }
);

export const listAllSeoMetaDataAction = createSafeAction(
  {
    schema: z.object({}),
    roles: ["ADMIN", "CONTENT_MANAGER"],
    requireAuth: true,
  },
  async () => {
    await connectDB();
    const list = await SeoMetaData.find({}).sort({ routeSlug: 1 }).lean();
    return JSON.parse(JSON.stringify(list));
  }
);
