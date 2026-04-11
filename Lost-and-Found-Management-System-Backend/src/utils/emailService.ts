export async function sendLoginOtp(to: string, subject: string, html: string) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Back2u" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    console.log("Email sent:", response.status);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}
