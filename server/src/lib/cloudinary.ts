import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Upload a file buffer to Cloudinary with auto-compression */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'portfolio',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const isImage = resourceType === 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        quality:       'auto:good',
        fetch_format:  'auto',
        // Resize images to max 1280px wide — saves Cloudinary storage
        ...(isImage && { width: 1280, crop: 'limit' }),
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/** Delete a single asset from Cloudinary */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
) {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Extract the Cloudinary public_id from a secure URL.
 * Example URL: https://res.cloudinary.com/cloud/image/upload/v123/portfolio/abc.jpg
 * Returns: "portfolio/abc"
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    // Match everything after /upload/ (optionally skipping version segment), strip extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Delete multiple Cloudinary assets in parallel.
 * Silently ignores URLs that are not from Cloudinary (e.g. YouTube thumbnails).
 */
export async function deleteManyFromCloudinary(urls: string[]) {
  const jobs = urls
    .map(extractPublicId)
    .filter((id): id is string => Boolean(id))
    .map(id => deleteFromCloudinary(id));
  return Promise.allSettled(jobs);
}

export default cloudinary;
