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

const fileFilter = (_req, file, cb) => {
  const allowedExt = /mp4|webm|mov|mkv/;
  const extname = allowedExt.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const allowedMime = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
  ].includes(file.mimetype);

  if (extname && allowedMime) {
    return cb(null, true);
  }
  cb(new Error("Chỉ cho phép upload video (mp4, webm, mov, mkv)"));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;
