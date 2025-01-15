import { s3 } from "./awsConfig";
import fs from "fs";

/**
 * Subir archivo a S3
 * @param filePath Ruta del archivo local
 * @param key Nombre del archivo en S3
 */
export const uploadFileToS3 = async (filePath: string, key: string) => {
  try {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: key,
      Body: fileContent,
      ACL: "public-read", // Hacer público el archivo
    };

    const data = await s3.upload(params).promise();
    return data.Location; // URL del archivo subido
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

export const generatePresignedUrl = (key: string): string => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    Expires: 60 * 5, // URL válida por 5 minutos
  };

  return s3.getSignedUrl("putObject", params);
};
