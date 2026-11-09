/**
 * Gmail API service to send emails on behalf of the user
 */

interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  bodyText: string;
  accessToken: string;
}

export const sendGmailMessage = async ({
  to,
  from,
  subject,
  bodyText,
  accessToken
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Build MIME RFC 2822 message
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText
    ];
    const message = messageParts.join('\r\n');
    
    // Base64URL encode
    const base64Encoded = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Encoded
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send email via Gmail API:', err);
    return { success: false, error: err.message || 'Error al enviar email' };
  }
};
