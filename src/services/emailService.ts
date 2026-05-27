export interface EmailData {
  email: string;
  name: string;
  planName?: string;
  amount?: string;
  currency?: string;
  daysLeft?: number;
}

export const sendPaymentSuccessEmail = async (data: EmailData) => {
  try {
    const response = await fetch('/api/email/payment-success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to send payment success email:', error);
    return { error: 'Failed to send email' };
  }
};

export const sendExpirationEmail = async (data: EmailData) => {
  try {
    const response = await fetch('/api/email/subscription-expiring', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to send expiration email:', error);
    return { error: 'Failed to send email' };
  }
};

export const verifyPaymentScreenshot = async (image: string, tid: string, planPrice: string) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, tid, planPrice }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to verify payment:', error);
    return { success: false, error: 'Network error during verification' };
  }
};
