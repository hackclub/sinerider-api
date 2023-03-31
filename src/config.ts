import Airtable from "airtable";
import { config } from "dotenv";

config();

const SINERIDER_AIRTABLE_API_KEY = process.env.SINERIDER_AIRTABLE_API_KEY;

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: SINERIDER_AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.SINERIDER_AIRTABLE_BASE as string);

// cloudflare stuff
export const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export { base };
