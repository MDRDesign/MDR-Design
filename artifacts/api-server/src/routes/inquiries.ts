import { Router, type IRouter } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { CreateInquiryBody, CreateInquiryResponse } from "@workspace/api-zod";
import { sendInquiryNotification } from "../lib/inquiry-notifications";

const router: IRouter = Router();
const attempts = new Map<string, { count: number; expires: number }>();
const confirmation = { message: "Thank you for sharing your business with me. Your inquiry is safely received. I look forward to learning more. — Danielle" };

router.post("/inquiries", async (req, res): Promise<void> => {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  for (const [ip, bucket] of attempts) {
    if (bucket.expires < now) attempts.delete(ip);
  }
  const bucket = attempts.get(key) ?? { count: 0, expires: now + 15 * 60_000 };
  bucket.count++;
  attempts.set(key, bucket);
  if (bucket.count > 8) {
    res.set("Retry-After", String(Math.ceil((bucket.expires - now) / 1000)));
    res.status(429).json({ error: "Please wait a little before sending another inquiry." });
    return;
  }
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the required fields and your email address." });
    return;
  }
  const { honeypot, ...input } = parsed.data;
  if (honeypot) {
    res.status(201).json(CreateInquiryResponse.parse(confirmation));
    return;
  }
  const data = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])) as typeof input;
  if ([data.name, data.business, data.need, data.budget, data.timeline, data.message].some((v) => !v)) {
    res.status(400).json({ error: "Please complete all required fields." });
    return;
  }
  if (data.website) {
    try {
      const url = new URL(/^https?:\/\//i.test(data.website) ? data.website : `https://${data.website}`);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error("Invalid website");
      data.website = url.href;
    } catch {
      res.status(400).json({ error: "Please enter a valid website address, or leave it blank." });
      return;
    }
  }
  const storedData = { ...data, website: data.website || null, source: data.source || null };
  let inquiryId: number;
  try {
    const [inquiry] = await db.insert(inquiriesTable).values(storedData).returning({ id: inquiriesTable.id });
    inquiryId = inquiry.id;
  } catch (error) {
    req.log.error({ err: error }, "Inquiry storage failed");
    res.status(503).json({ error: "Your inquiry could not be saved. Please try again shortly." });
    return;
  }
  // Notification errors must never undo a saved inquiry or encourage a duplicate submission.
  try {
    const result = await sendInquiryNotification(storedData, inquiryId);
    if (result.ok) {
      req.log.info({ inquiryId, emailId: result.emailId }, "Inquiry notification accepted");
    } else {
      req.log.warn({ inquiryId, status: result.status, reason: result.reason }, "Inquiry saved; notification not accepted");
    }
  } catch {
    // Do not log request data, connector credentials, or provider error bodies.
    req.log.warn({ inquiryId }, "Inquiry saved; notification unavailable");
  }
  res.status(201).json(CreateInquiryResponse.parse(confirmation));
});

export default router;
