import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Cambia esto según tu proveedor de correo (por ejemplo, "SendGrid", "Yahoo", etc.)
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASSWORD, // Contraseña o token de aplicación
  },
});

/**
 * Función para enviar un correo electrónico
 * @param to - Dirección del destinatario
 * @param subject - Asunto del correo
 * @param text - Texto plano del correo
 * @param html - (Opcional) Contenido HTML del correo
 * @returns Promesa con el resultado del envío
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Remitente
      to, // Destinatario
      subject, // Asunto
      text, // Texto plano
      html, // Contenido HTML (opcional)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email");
  }
};
