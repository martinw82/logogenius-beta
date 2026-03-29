/**
 * Email Notification Service
 * Manages transactional emails for the LogoGenius platform
 *
 * Uses Resend for email delivery: https://resend.com
 * Configure via RESEND_API_KEY and RESEND_FROM_EMAIL env vars
 */

export interface EmailPayload {
  to: string;
  subject: string;
  templateId?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

export interface EmailNotificationLog {
  id: string;
  to: string;
  subject: string;
  type: string;
  orderId?: number;
  sentAt: Date;
  success: boolean;
  error?: string;
}

const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_APPROVED: 'order-approved',
  LOGO_SELECTION_READY: 'logo-selection-ready',
  DASHBOARD_ACCESS: 'dashboard-access',
  REVISION_COMPLETED: 'revision-completed',
  ADMIN_NEW_ORDER: 'admin-new-order',
  ADMIN_REVISION_REQUEST: 'admin-revision-request',
  ADMIN_FEEDBACK_RECEIVED: 'admin-feedback-received',
};

/**
 * Generate HTML email template
 * @param templateId - Template ID
 * @param data - Data to inject into template
 * @returns HTML string
 */
function generateTemplate(templateId: string, data: Record<string, any>): string {
  switch (templateId) {
    case EMAIL_TEMPLATES.ORDER_CONFIRMATION:
      return generateOrderConfirmationTemplate(data);
    case EMAIL_TEMPLATES.ORDER_APPROVED:
      return generateApprovedTemplate(data);
    case EMAIL_TEMPLATES.LOGO_SELECTION_READY:
      return generateLogoSelectionTemplate(data);
    case EMAIL_TEMPLATES.DASHBOARD_ACCESS:
      return generateDashboardAccessTemplate(data);
    case EMAIL_TEMPLATES.REVISION_COMPLETED:
      return generateRevisionCompletedTemplate(data);
    default:
      return generateGenericTemplate(data);
  }
}

function generateOrderConfirmationTemplate(data: any): string {
  return `
    <h1>Order Confirmed!</h1>
    <p>Hi there,</p>
    <p>Thank you for your <strong>${data.tier}</strong> package purchase.</p>
    <p>Order ID: <strong>#${data.orderId}</strong></p>
    <p>We're now generating your custom logo designs. You'll receive another email once your logos are ready for review.</p>
    <p><strong>What happens next:</strong></p>
    <ol>
      <li>AI generates 4 unique logo concepts</li>
      <li>We create professional mockups</li>
      <li>You review and select your favorite</li>
      <li>We deliver your complete brand kit</li>
    </ol>
    <p>Questions? Reply to this email or contact support@logogenius.com</p>
  `;
}

function generateApprovedTemplate(data: any): string {
  return `
    <h1>Your Order Has Been Approved!</h1>
    <p>Hi ${data.customerName || 'there'},</p>
    <p>Great news! Your logo order (ID: <strong>${data.orderId}</strong>) has been reviewed and approved by our team.</p>
    <p>Next step: Select your preferred logo variant and review the mockups.</p>
    <p><a href="${data.selectionLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">View Your Logos</a></p>
    <p>Questions? Reply to this email or contact support@logogenius.com</p>
  `;
}

function generateLogoSelectionTemplate(data: any): string {
  return `
    <h1>Select Your Logo Variant</h1>
    <p>Hi ${data.customerName || 'there'},</p>
    <p>Your 4 unique logo variants are ready for your review!</p>
    <p>You can now see each variant on real-world mockups (letterhead, t-shirt, business card) to help you choose the best option for your brand.</p>
    <p><a href="${data.selectionLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Preview & Select Logo</a></p>
    <p>Timeline: You'll receive your complete brand package within 24 hours of selection.</p>
  `;
}

function generateDashboardAccessTemplate(data: any): string {
  return `
    <h1>🎉 Your Brand Assets Are Ready!</h1>
    <p>Hi ${data.customerName || 'there'},</p>
    <p>Your complete brand package is now ready for download. Access all your assets including:</p>
    <ul>
      <li>✓ Logo variants (SVG)</li>
      <li>✓ Mockup images</li>
      <li>✓ Brand guide (PDF)</li>
      <li>✓ Color swatches</li>
      <li>✓ Typography guide</li>
    </ul>
    <p><a href="${data.dashboardLink}" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Access Your Dashboard</a></p>
    <p>This link remains valid for 1 year. You can request up to 2 revisions if you'd like any adjustments.</p>
  `;
}

function generateRevisionCompletedTemplate(data: any): string {
  return `
    <h1>Your Revision Is Complete!</h1>
    <p>Hi ${data.customerName || 'there'},</p>
    <p>Your requested changes to the brand guide have been processed.</p>
    <p>Version updated: <strong>${data.previousVersion}</strong> → <strong>${data.newVersion}</strong></p>
    <p>Sections revised: ${data.revisedSections}</p>
    <p><a href="${data.dashboardLink}" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">View Updated Guide</a></p>
  `;
}

function generateGenericTemplate(data: any): string {
  return `
    <h1>${data.subject}</h1>
    <p>${data.message}</p>
    <footer style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
      LogoGenius © ${new Date().getFullYear()} | support@logogenius.com
    </footer>
  `;
}

/**
 * Send order confirmation email after successful payment
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderId: number,
  tier: string
): Promise<EmailNotificationLog | null> {
  const tierNames: Record<string, string> = {
    basic: 'Starter',
    pro: 'Professional',
    premium: 'Enterprise',
  };

  const email: EmailPayload = {
    to: customerEmail,
    subject: `Order Confirmed - LogoGenius ${tierNames[tier] || tier} Package`,
    templateId: EMAIL_TEMPLATES.ORDER_CONFIRMATION,
    data: { orderId, tier: tierNames[tier] || tier },
  };

  return sendEmail(email, 'order-confirmation', orderId);
}

/**
 * Send order approved email to customer
 * @param customerEmail - Customer email address
 * @param customerName - Customer name
 * @param orderId - Order ID
 * @param selectionLink - Link to logo selection page
 */
export async function sendOrderApprovedEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  selectionLink: string
): Promise<EmailNotificationLog | null> {
  const email: EmailPayload = {
    to: customerEmail,
    subject: `Your Logo Design Order #${orderId} is Ready for Review`,
    templateId: EMAIL_TEMPLATES.ORDER_APPROVED,
    data: { customerName, orderId, selectionLink },
  };

  return sendEmail(email, 'order-approved', orderId);
}

/**
 * Send logo selection ready email to customer
 */
export async function sendLogoSelectionEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  selectionLink: string
): Promise<EmailNotificationLog | null> {
  const email: EmailPayload = {
    to: customerEmail,
    subject: '4 Unique Logo Variants Ready for Your Review',
    templateId: EMAIL_TEMPLATES.LOGO_SELECTION_READY,
    data: { customerName, orderId, selectionLink },
  };

  return sendEmail(email, 'logo-selection', orderId);
}

/**
 * Send dashboard access email to customer
 */
export async function sendDashboardAccessEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  dashboardLink: string
): Promise<EmailNotificationLog | null> {
  const email: EmailPayload = {
    to: customerEmail,
    subject: 'Your Brand Assets Are Ready - Access Your Dashboard',
    templateId: EMAIL_TEMPLATES.DASHBOARD_ACCESS,
    data: { customerName, orderId, dashboardLink },
  };

  return sendEmail(email, 'dashboard-access', orderId);
}

/**
 * Send revision completed email to customer
 */
export async function sendRevisionCompletedEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  dashboardLink: string,
  previousVersion: string,
  newVersion: string,
  revisedSections: string
): Promise<EmailNotificationLog | null> {
  const email: EmailPayload = {
    to: customerEmail,
    subject: `Brand Guide Updated - Version ${newVersion}`,
    templateId: EMAIL_TEMPLATES.REVISION_COMPLETED,
    data: {
      customerName,
      orderId,
      dashboardLink,
      previousVersion,
      newVersion,
      revisedSections,
    },
  };

  return sendEmail(email, 'revision-completed', orderId);
}

/**
 * Send admin notification of new order
 */
export async function sendAdminNewOrderEmail(
  adminEmail: string,
  orderId: number,
  customerEmail: string,
  tier: string,
  businessName: string
): Promise<EmailNotificationLog | null> {
  const html = `
    <h1>New Order Received</h1>
    <p>A new ${tier} tier order has been received:</p>
    <ul>
      <li>Order ID: <strong>${orderId}</strong></li>
      <li>Customer Email: <strong>${customerEmail}</strong></li>
      <li>Business Name: <strong>${businessName}</strong></li>
      <li>Tier: <strong>${tier}</strong></li>
      <li>Received: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}">View Order in Admin Panel</a></p>
  `;

  const email: EmailPayload = {
    to: adminEmail,
    subject: `[LogoGenius Admin] New Order #${orderId} - ${businessName}`,
    html,
  };

  return sendEmail(email, 'admin-new-order', orderId);
}

/**
 * Send admin notification of revision request
 */
export async function sendAdminRevisionRequestEmail(
  adminEmail: string,
  orderId: number,
  customerEmail: string,
  sections: string,
  notes: string
): Promise<EmailNotificationLog | null> {
  const html = `
    <h1>Revision Request Received</h1>
    <p>A customer has requested revisions:</p>
    <ul>
      <li>Order ID: <strong>${orderId}</strong></li>
      <li>Customer Email: <strong>${customerEmail}</strong></li>
      <li>Sections: <strong>${sections}</strong></li>
      <li>Notes: <em>${notes}</em></li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}">View Order in Admin Panel</a></p>
  `;

  const email: EmailPayload = {
    to: adminEmail,
    subject: `[LogoGenius Admin] Revision Request for Order #${orderId}`,
    html,
  };

  return sendEmail(email, 'admin-revision-request', orderId);
}

/**
 * Send admin notification of customer feedback
 */
export async function sendAdminFeedbackEmail(
  adminEmail: string,
  orderId: number,
  customerEmail: string,
  rating: number,
  feedback: string
): Promise<EmailNotificationLog | null> {
  const html = `
    <h1>Customer Feedback Received</h1>
    <p>A customer has provided feedback:</p>
    <ul>
      <li>Order ID: <strong>${orderId}</strong></li>
      <li>Customer Email: <strong>${customerEmail}</strong></li>
      <li>Rating: <strong>${rating}/5 stars</strong></li>
      <li>Feedback: <p><em>${feedback || '(no additional comments)'}</em></p></li>
    </ul>
  `;

  const email: EmailPayload = {
    to: adminEmail,
    subject: `[LogoGenius Admin] Feedback for Order #${orderId} - ${rating}★`,
    html,
  };

  return sendEmail(email, 'admin-feedback', orderId);
}

/**
 * Main email sending function
 * Integrates with Resend email service
 * Falls back gracefully if not configured
 */
async function sendEmail(
  email: EmailPayload,
  type: string,
  orderId?: number
): Promise<EmailNotificationLog | null> {
  const log: EmailNotificationLog = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to: email.to,
    subject: email.subject,
    type,
    orderId,
    sentAt: new Date(),
    success: false,
  };

  try {
    // Generate HTML if not provided
    const html = email.html || (email.templateId ? generateTemplate(email.templateId, email.data || {}) : '');

    // Fire-and-forget: don't block order processing
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email send');
      console.log(`📧 Email would have been sent: ${type} to ${email.to}`);
      log.success = true; // Don't fail the order
      return log;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LogoGenius <noreply@logogenius.com>';

    const result = await resend.emails.send({
      from: fromEmail,
      to: email.to,
      subject: email.subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`✅ Email sent: ${type} to ${email.to} (id: ${result.data?.id})`);
    log.success = true;
    return log;
  } catch (error) {
    // Don't throw — email failure should not block order processing
    log.success = false;
    log.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to send email: ${type}`, error);
    return log;
  }
}
