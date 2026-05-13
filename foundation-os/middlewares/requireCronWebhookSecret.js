/**
 * Validates `Authorization: Bearer <WEBHOOK_CRON_SECRET>` or header `x-cron-secret`.
 * Use a long random secret; never commit it.
 */
module.exports = function requireCronWebhookSecret(req, res, next) {
  const secret = process.env.WEBHOOK_CRON_SECRET;
  if (!secret) {
    console.warn("[cron-webhook] WEBHOOK_CRON_SECRET is unset; refusing requests.");
    return res.status(503).json({
      message:
        "Cron webhook is disabled until WEBHOOK_CRON_SECRET is configured on the server.",
    });
  }

  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7).trim()
    : null;
  const provided = bearer || req.get("x-cron-secret");

  if (provided !== secret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
