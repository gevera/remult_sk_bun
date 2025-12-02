import { Module } from "remult/server";
import { File } from "../s2filesEntities";
import { S3Client, randomUUIDv7 } from "bun";
import { env } from "$env/dynamic/private";

// S3 client configuration helper
export function getS3Client(): S3Client {
  if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    throw new Error("Missing required R2/S3 environment variables");
  }

  return new S3Client({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET_NAME,
    endpoint: env.R2_ENDPOINT,
    region: env.R2_REGION || "auto",
  });
}

// UUID generation helper (server-only)
export function generateFileUUID(): string {
  return randomUUIDv7();
}

export const s2files = () =>
  new Module({
    key: "s2files",
    entities: [File],
  });

