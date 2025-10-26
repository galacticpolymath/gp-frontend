import { createSubscriptionCancellationEmail } from '../emailTemplates/gpPlusSubCancelation';

type TReqMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

class BrevoOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  headers: HeadersInit;
  constructor(method: TReqMethod = "GET") {
    this.method = method;
    this.headers = {
      accept: "application/json",
      "content-type": "application/json",
    };

    if (process.env.BREVO_API_KEY) {
      this.headers["api-key"] = process.env.BREVO_API_KEY;
    }
  }
}

type TCancelationType = Parameters<typeof createSubscriptionCancellationEmail>[0];

const createGpPlusSubCanceledEmail = (toEmail: string, cancelationType: TCancelationType, toName?: string) => {
    const to = toName ? [{ email: toEmail, name: toName }] : [{ email: toEmail }]

  return {
    sender: { name: "Support", email: "techguy@galacticpolymath.com" },
    to,
    subject: "Subscription canceled confirmation",
    htmlContent: createSubscriptionCancellationEmail(cancelationType, toName),
  };
};

export const sendGpPlusSubCanceledEmail = async (
  email: string,
  cancelationType: TCancelationType,
  recipientName?: string,
) => {
  try {
    const options = new BrevoOptions("POST");
    const url = "https://api.brevo.com/v3/smtp/email";
    const body = JSON.stringify(
      createGpPlusSubCanceledEmail(email, cancelationType, recipientName)
    );
    const response = await fetch(url, { body, ...options });

    console.log(
      "sendGpPlusSubCanceledEmail response status: ",
      response.status
    );

    if (response.status !== 201) {
      throw new Error(
        "Failed to send GP Plus subscription canceled email. Status code: " +
          response.status
      );
    }

    return {
      wasSuccessful: true,
    };
  } catch (error) {
    console.error("Error sending GP Plus subscription canceled email: ", error);

    return {
      wasSuccessful: false,
    };
  }
};
