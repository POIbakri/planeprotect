import { Resend } from 'resend';
import { logger } from './logger';
import { supabase } from './api';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export type EmailTemplate = 
  | 'welcome'
  | 'claim_submitted'
  | 'claim_in_review'
  | 'claim_approved'
  | 'claim_paid'
  | 'password_reset'
  | 'account_confirmation';

interface EmailData {
  to: string;
  name: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

const getEmailTemplate = async (templateName: EmailTemplate) => {
  const { data: template, error } = await supabase
    .from('email_templates')
    .select('subject, html_content')
    .eq('name', templateName)
    .single();

  if (error) {
    logger.error('Failed to fetch email template', error);
    throw error;
  }

  return template;
};

const replaceVariables = (content: string, data: Record<string, any>) => {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'appUrl') return window.location.origin;
    return data[key] || match;
  });
};

export async function sendEmail({ to, name, template, data = {} }: EmailData) {
  try {
    // Get template from database
    const emailTemplate = await getEmailTemplate(template);

    // Replace variables in template
    const templateData = {
      name,
      ...data,
      appUrl: window.location.origin,
    };

    const html = replaceVariables(emailTemplate.html_content, templateData);
    const subject = replaceVariables(emailTemplate.subject, templateData);

    // Send email
    const response = await resend.emails.send({
      from: 'RefundHero <claims@refundhero.com>',
      to: [to],
      subject,
      html,
    });

    // Log success
    logger.info('Email sent successfully', {
      template,
      to,
      messageId: response.data?.id,
    });

    // Record email in database
    await supabase.from('sent_emails').insert([{
      template,
      recipient: to,
      subject,
      status: 'sent',
      metadata: {
        messageId: response.data?.id,
        templateData,
      },
    }]);

    return response;
  } catch (error) {
    // Log error
    logger.error('Failed to send email', error as Error, {
      template,
      to,
    });

    // Record failed email
    await supabase.from('sent_emails').insert([{
      template,
      recipient: to,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }]);

    throw error;
  }
}

export async function updateEmailPreferences(userId: string, preferences: Record<string, boolean>) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        email_preferences: preferences,
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    logger.error('Failed to update email preferences', error as Error);
    throw error;
  }
}

export async function shouldSendEmail(userId: string, templateType: EmailTemplate): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // If no preferences are set, default to sending all emails
    if (!profile?.email_preferences) return true;

    return profile.email_preferences[templateType] !== false;
  } catch (error) {
    logger.error('Failed to check email preferences', error as Error);
    return true; // Default to sending email if check fails
  }
}