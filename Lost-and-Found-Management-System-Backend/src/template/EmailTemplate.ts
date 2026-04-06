export const LoginTemplate = (otp:number) =>{
  return`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Back2u – Login OTP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;font-family:'Sora',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08);">

          <!-- Header Band -->
          <tr>
            <td style="background:#1a1a2e;padding:36px 40px 32px;text-align:left;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Logo mark -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#e8ff5a;border-radius:10px;width:42px;height:42px;text-align:center;vertical-align:middle;font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#1a1a2e;letter-spacing:-1px;">
                          B2
                        </td>
                        <td style="padding-left:14px;">
                          <div style="font-family:'Sora',sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1;">Back2u</div>
                          <div style="font-family:'Sora',sans-serif;font-size:11px;font-weight:300;color:#8888aa;letter-spacing:2px;text-transform:uppercase;margin-top:3px;">Lost & Found</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Decorative dots -->
              <div style="margin-top:28px;opacity:0.15;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#e8ff5a;margin-right:5px;"></span>
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#e8ff5a;margin-right:5px;"></span>
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#e8ff5a;"></span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 36px;">

              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#e8885a;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1a1a2e;line-height:1.25;letter-spacing:-0.5px;">
                Here's your one-time<br/>login code
              </h1>
              <p style="margin:0 0 36px;font-size:15px;color:#555577;line-height:1.7;font-weight:300;">
                Use the code below to complete your sign-in to Back2u. It's valid for <strong style="color:#1a1a2e;font-weight:600;">10 minutes</strong> and can only be used once.
              </p>

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#f5f3ee;border-radius:14px;border:2px solid #e8e5de;padding:28px 24px;text-align:center;">
                    <div style="font-family:'DM Mono',monospace;font-size:48px;font-weight:500;letter-spacing:14px;color:#1a1a2e;line-height:1;">
                      ${otp}
                    </div>
                    <div style="margin-top:12px;font-size:12px;color:#9999bb;letter-spacing:1.5px;text-transform:uppercase;font-weight:400;">
                      Your login OTP
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Timer note -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#fff8f0;border-left:3px solid #e8885a;border-radius:0 8px 8px 0;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#c06030;line-height:1.6;">
                      ⏱ &nbsp;This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email — your account remains secure.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #ece9e3;margin:0 0 30px;" />

              <!-- Security note -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:top;width:32px;padding-top:2px;">
                    <div style="width:28px;height:28px;background:#eef0ff;border-radius:50%;text-align:center;line-height:28px;font-size:14px;">🔒</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:13px;color:#888899;line-height:1.7;">
                      Back2u will <strong style="color:#555577;">never</strong> ask you to share this code with anyone. If someone requests it, treat it as a phishing attempt.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f3ee;border-top:1px solid #ece9e3;padding:24px 40px;text-align:left;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#aaaabb;line-height:1.6;">
                      You're receiving this because a login was attempted on your Back2u account.<br/>
                      Questions? Reach us at <a href="mailto:support@back2u.app" style="color:#e8885a;text-decoration:none;">support@back2u.app</a>
                    </p>
                  </td>
                  <td style="text-align:right;vertical-align:bottom;white-space:nowrap;padding-left:20px;">
                    <span style="font-family:'DM Mono',monospace;font-size:11px;color:#ccccdd;letter-spacing:1px;">Back2u © 2025</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `
}