import dotenv from "dotenv";

dotenv.config();

// Safeparsing env from process.env via zod

import { z } from "zod";

function envParse(env: NodeJS.ProcessEnv) {
  const envSchema = z.object({
    CLIENT_URL: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    USER_TOKEN_SECRET: z.string(),
    USER_TOKEN_EXPIRY: z.string(),
    MONGO_URI: z.string(),
    NODE_ENV: z.string(),
    PORT: z.coerce.number(),
  });

  const parsedEnv = envSchema.safeParse(env);
  if (!parsedEnv.success) {
    throw new Error(
      `Invalid environment variables: ${parsedEnv.error.message}`,
    );
  }
  return parsedEnv.data;
}

export const env = envParse(process.env);
