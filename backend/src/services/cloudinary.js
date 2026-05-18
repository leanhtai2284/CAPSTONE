import { v2 as cloudinary } from "cloudinary";

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ensureConfigured = () => {
  if (!hasCloudinaryConfig) {
    throw new Error("Cloudinary config is missing");
  }
};

const uploadBuffer = (buffer, options = {}) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );
    stream.end(buffer);
  });
};

export const uploadImage = (buffer, options = {}) =>
  uploadBuffer(buffer, { resource_type: "image", ...options });

export const uploadVideo = (buffer, options = {}) =>
  uploadBuffer(buffer, { resource_type: "video", ...options });

export const getCloudinary = () => cloudinary;
