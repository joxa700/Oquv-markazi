export async function notifyNewApplication(application, courseName) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    'New course application',
    `Name: ${application.firstName} ${application.lastName}`,
    `Phone: ${application.phone}`,
    `Course: ${courseName}`,
    `Language: ${application.preferredLanguage}`,
  ];
  if (application.ageOrLevel) lines.push(`Age/level: ${application.ageOrLevel}`);
  if (application.comment) lines.push(`Comment: ${application.comment}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (error) {
    console.warn('[telegram] Notification failed:', error.message);
  }
}
