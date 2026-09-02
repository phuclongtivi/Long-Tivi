/**
 * Gửi email (dev: log console; production: gắn Resend/SendGrid)
 */
export async function sendAppEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const to = opts.to.trim();
  if (!to) return { ok: false, error: 'missing to' };

  console.log(`[Email] to=${to}\nsubject=${opts.subject}\n${opts.text}`);

  // Resend (nếu có key)
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Long App <noreply@phuclongtivi.com>';
  if (key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: opts.subject,
          text: opts.text,
          html: opts.html || `<pre>${opts.text}</pre>`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error', err);
        return { ok: false, error: err };
      }
      return { ok: true };
    } catch (e: any) {
      console.error(e);
      return { ok: false, error: e.message };
    }
  }

  return { ok: true, dev: true };
}

export async function getBossEmails(): Promise<string[]> {
  const env = (process.env.BOSS_EMAIL || '').trim().toLowerCase();
  const list: string[] = [];
  if (env) list.push(env);
  try {
    const { prisma } = await import('@/lib/prisma');
    const bosses = await prisma.user.findMany({
      where: { role: 'boss' },
      select: { email: true },
    });
    for (const b of bosses) {
      if (b.email && !list.includes(b.email.toLowerCase())) {
        list.push(b.email.toLowerCase());
      }
    }
  } catch {
    /* ignore */
  }
  return list;
}
