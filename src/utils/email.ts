import nodemailer from "nodemailer";

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Cambia según tu proveedor
    auth: {
      user: process.env.EMAIL_USER, // Correo del remitente
      pass: process.env.EMAIL_PASSWORD, // Contraseña del remitente
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};
