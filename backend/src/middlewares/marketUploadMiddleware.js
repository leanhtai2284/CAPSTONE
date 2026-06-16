import multer from "multer";
import path from "path";

const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|jfif|heic|heif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb(
    new Error(
      "Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WEBP, JFIF, HEIC/HEIF)",
    ),
  );
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;
