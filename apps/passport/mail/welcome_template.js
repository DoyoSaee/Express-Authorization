// Returns a Nodemailer email data object for the welcome email
// to: recipient email, name: recipient display name
module.exports = function (to, name) {
  const safeName = name || "회원";
  const fromEmail = process.env.GMAIL_USER;
  const fromName = process.env.GMAIL_FROM_NAME;
  const from = fromName && fromEmail ? `${fromName} <${fromEmail}>` : fromEmail;

  const subject = `환영합니다, ${safeName}님!`;
  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#222;">
    <h2 style="margin:0 0 12px;">반갑습니다, ${safeName}님 👋</h2>
    <p>Google 계정으로 회원가입이 완료되었습니다.</p>
    <ul style="padding-left:20px;">
      <li><strong>이메일:</strong> ${to}</li>
      <li><strong>가입 경로:</strong> Google OAuth</li>
    </ul>
    <p>이 서비스가 더욱 편리하도록 계속 개선하겠습니다. 이용해주셔서 감사합니다!</p>
    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
    <p style="font-size:12px; color:#666;">본 메일은 발신 전용입니다. 문의는 서비스 내 도움말을 이용해 주세요.</p>
  </div>`;

  const text = `반갑습니다, ${safeName}님!\n\nGoogle 계정으로 회원가입이 완료되었습니다.\n- 이메일: ${to}\n- 가입 경로: Google OAuth\n\n이용해주셔서 감사합니다!`;

  return {
    from,
    to,
    subject,
    html,
    text,
  };
};
