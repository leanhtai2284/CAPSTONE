import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads/ugc";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const allowedImageExt = /jpeg|jpg|png|gif|webp/;
const allowedImageMime = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

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
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;
