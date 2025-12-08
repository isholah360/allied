import nodemailer from "nodemailer";

export const sendOfficerEmail = async ({
  gmailUser,
  gmailPass,
  officerEmail,
  officerPassword
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"Agri Support" <${gmailUser}>`,
      to: officerEmail,
      subject: "Officer Account Created",
      html: `
        <h2>Welcome to Oyo Agro System</h2>
        <p>Your officer account has been successfully created.</p>
        <p><b>Email:</b> ${officerEmail}</p>
        <p><b>Password:</b> ${officerPassword}</p>
        <p>Please log in and change your password immediately.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✔ Email sent successfully");
  } catch (err) {
    console.error("❌ Email error:", err);
    throw new Error("Failed to send email");
  }
};
