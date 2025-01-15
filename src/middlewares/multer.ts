import multer from "multer";
import path from "path";

// Configuración de Multer
const storage = multer.memoryStorage(); // Almacena los archivos en memoria para subirlos directamente a S3

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB por archivo
  fileFilter: (req, file, cb) => {
    // Extensiones permitidas
    const allowedExtensions = /jpeg|jpg|png|gif|pdf|docx|xlsx|txt/;
    const extname = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); // Archivo válido
    } else {
      cb(new Error("Invalid file type. Only images and documents are allowed")); // Archivo no válido
    }
  },
});
