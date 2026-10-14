import { Storage } from "@google-cloud/storage";

// Replit App Storage sidecar authentication, matching the storage blueprint.
const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
export const studioStorage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

/** Search only the public area, never private uploads or arbitrary buckets. */
export async function findStudioAsset(filename: string) {
  const paths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  if (!paths.length) throw new Error("Public studio asset storage is not configured");
  for (const path of paths) {
    const [bucket, ...prefix] = path.replace(/^\/+/, "").split("/");
    const file = studioStorage.bucket(bucket).file([...prefix, "media", filename].join("/"));
    try {
      const [metadata] = await file.getMetadata();
      return { file, metadata };
    } catch (error) {
      if ((error as { code?: number }).code !== 404) throw error;
    }
  }
  return null;
}
