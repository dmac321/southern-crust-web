const { SquareClient, SquareEnvironment } = require("square");
const { randomUUID } = require("crypto");

const environment =
  process.env.SQUARE_ENV === "sandbox"
    ? SquareEnvironment.Sandbox
    : SquareEnvironment.Production;

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { sourceId, amountCents, note } = req.body;

  if (!sourceId || typeof amountCents !== "number" || amountCents <= 0) {
    res.status(400).json({ error: "Invalid payment request." });
    return;
  }

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amountCents)),
        currency: "USD",
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note,
    });

    if (response.errors?.length) {
      const msg = response.errors[0].detail ?? "Payment was declined.";
      res.status(400).json({ error: msg });
      return;
    }

    if (!response.payment) {
      res.status(500).json({ error: "Payment failed. Please try again." });
      return;
    }

    res.status(200).json({
      paymentId: response.payment.id,
      status: response.payment.status,
    });
  } catch (err) {
    const msg =
      err?.errors?.[0]?.detail ??
      err?.message ??
      "Payment failed. Please try again.";
    res.status(400).json({ error: msg });
  }
};
