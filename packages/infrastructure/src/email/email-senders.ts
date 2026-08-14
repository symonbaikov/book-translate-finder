import nodemailer from 'nodemailer';
import type { EmailSender, WelcomeEmail } from '@btf/domain';
import type { Logger } from 'pino';

/**
 * The self-hosting default: no SMTP configured, so no mail is sent and sign-up still works.
 *
 * This is a deliberate product decision, not a stub. `docker compose up` must produce a working
 * instance without asking anyone for mail credentials (CLAUDE.md), and gating registration on a
 * greeting nobody needs would turn the three-command install into a support thread.
 */
export class NoopEmailSender implements EmailSender {
  constructor(private readonly logger?: Logger) {}

  async sendWelcome(email: WelcomeEmail): Promise<void> {
    this.logger?.debug(
      { to: email.to.value },
      'welcome email skipped — no SMTP_URL configured on this instance',
    );
  }
}

export interface SmtpEmailSenderOptions {
  smtpUrl: string;
  from: string;
  /** Public URL of this instance, so the greeting can link back to it. */
  publicUrl: string;
}

/** SMTP delivery, used only when `SMTP_URL` is set. */
export class SmtpEmailSender implements EmailSender {
  private readonly transport: nodemailer.Transporter;

  constructor(private readonly options: SmtpEmailSenderOptions) {
    this.transport = nodemailer.createTransport(options.smtpUrl);
  }

  async sendWelcome(email: WelcomeEmail): Promise<void> {
    const text = [
      `Hi ${email.displayName},`,
      '',
      'Your BookTranslate Finder account is ready.',
      '',
      'You can now save books you find and come back to them later — with the languages they',
      'were translated into, the editions that exist, and where to get each one legally.',
      '',
      this.options.publicUrl,
      '',
      'This instance is self-hosted and open source. If you did not create this account, you can',
      'ignore this message.',
    ].join('\n');

    await this.transport.sendMail({
      from: this.options.from,
      to: email.to.value,
      subject: 'Welcome to BookTranslate Finder',
      text,
    });
  }
}
