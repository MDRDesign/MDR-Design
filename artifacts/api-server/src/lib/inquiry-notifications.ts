import { ReplitConnectors } from "@replit/connectors-sdk";
import type { InsertInquiry } from "@workspace/db";

export const INQUIRY_RECIPIENT = "mdrorganization@gmail.com";
// Resend's default sender can notify the email owning the Resend account.
// Sending to any other recipient requires an address on a verified domain.
export const INQUIRY_SENDER = process.env.INQUIRY_EMAIL_FROM || "MDR Design <onboarding@resend.dev>";

export type NotificationResult =
  | { ok: true; emailId: string }
  | { ok: false; status: number; reason: string };

export function inquiryEmail(data: InsertInquiry) {
  const fields: [string, string][] = [
    ["Name", data.name],
    ["Business", data.business],
    ["Email", data.email],
    ["Website", data.website || "Not provided"],
    ["What you need", data.need],
    ["Budget range", data.budget],
    ["Timeline", data.timeline],
    ["Message", data.message],
    ["Source", data.source || "website"],
  ];
  return {
    from: INQUIRY_SENDER,
    to: [INQUIRY_RECIPIENT],
    reply_to: data.email,
    subject: `New MDR Design inquiry — ${data.business.replace(/[\r\n]/g, " ").slice(0, 180)}`,
    text: [
      "A new inquiry has been saved to the MDR Design database.",
      "",
      ...fields.map(([label, value]) => `${label}:\n${value}\n`),
    ].join("\n"),
  };
}

export async function sendInquiryNotification(
  data: InsertInquiry,
  inquiryId: number,
): Promise<NotificationResult> {
  // Acquire a fresh proxy client for each send; credentials never reach application code.
  const connectors = new ReplitConnectors();
  const proxyFetch = connectors.createProxyFetch("resend");
  const response = await proxyFetch("/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `mdr-inquiry-${inquiryId}`,
    },
    body: JSON.stringify(inquiryEmail(data)),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json() as { id?: string; name?: string };
  if (!response.ok || !result.id) {
    return { ok: false, status: response.status, reason: result.name || "email_not_accepted" };
  }
  return { ok: true, emailId: result.id };
}
