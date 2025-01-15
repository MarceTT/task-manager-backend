import multer from "multer";

const storage = multer.memoryStorage(); // Almacena los archivos en memoria

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB por archivo
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|pdf|docx|xlsx|txt/;
    const isValidExtension = allowedExtensions.test(file.mimetype);

    if (isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed types: jpeg, jpg, png, gif, pdf, docx, xlsx, txt"));
    }
  },
});
