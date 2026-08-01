import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail({ to, subject, title, date, resourceName }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SpaceSync <onboarding@resend.dev>', // Use your verified domain in production
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">SpaceSync Notification</h2>
          <p style="font-size: 16px; color: #ccc;">${title}</p>
          <div style="background: #111; padding: 15px; border-radius: 8px; border: 1px solid #333; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Resource:</strong> ${resourceName}</p>
            <p style="margin: 5px 0;"><strong>Time/Date:</strong> ${date}</p>
          </div>
          <p style="font-size: 12px; color: #666;">Manage your bookings anytime on your SpaceSync dashboard.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err.message };
  }
}