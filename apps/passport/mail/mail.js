const mailer = require("nodemailer");
const welcomeTemplate = require("./welcome_template");

function getEmailData(to, name, type) {
  switch (type) {
    case "welcome":
      return welcomeTemplate(to, name);
    default:
      return {
        from: process.env.GMAIL_USER,
        to,
        subject: "",
        html: "",
      };
  }
}

const sendMail = (to, name, type) => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    console.error(
      "[mailer] Missing GMAIL_USER/GMAIL_PASS env. Skipping email to:",
      to
    );
    return;
  }

  const transporter = mailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const mail = getEmailData(to, name, type);

  // Optional: verify SMTP connection for clearer diagnostics
  transporter.verify((verifyErr) => {
    if (verifyErr) {
      console.error("[mailer] SMTP verify failed:", verifyErr?.message || verifyErr);
    }
  });

  transporter.sendMail(mail, (err, res) => {
    if (err) {
      console.error("[mailer] sendMail error:", err?.message || err);
    } else {
      // Nodemailer returns a response object; log the messageId for traceability
      if (res && res.messageId) {
        console.log(`[mailer] sent: ${res.messageId}`);
      }
    }

    transporter.close();
  });
};

module.exports = sendMail;
