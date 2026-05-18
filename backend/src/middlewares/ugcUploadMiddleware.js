import multer from "multer";
import path from "path";

const allowedImageExt = /jpeg|jpg|png|gif|webp/;
const allowedImageMime = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const allowedVideoExt = /mp4|webm|mov|mkv/;
const allowedVideoMime = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (file.fieldname === "recipe_images") {
    const extOk = allowedImageExt.test(ext);
    const mimeOk = allowedImageMime.includes(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    return cb(new Error("Chỉ cho phép upload ảnh (jpeg, png, gif, webp)"));
  }

  if (file.fieldname === "cooking_video") {
    const extOk = allowedVideoExt.test(ext);
    const mimeOk = allowedVideoMime.includes(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    return cb(new Error("Chỉ cho phép upload video (mp4, webm, mov, mkv)"));
  }

  cb(new Error("Field không hợp lệ"));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;
