const crypto = require("crypto-js");
const axios = require("axios");
const moment = require("moment-timezone");
const { db } = require("../utils/firebase");
const { Timestamp } = require("firebase-admin/firestore");

const subscriptionValues = {
  SILVER: 15000,
};

const PAYSTACK_API_URL = "https://api.paystack.co";
const tz = process.env.CRON_TIMEZONE || "UTC";

/** Calendar-month bump as Firestore Timestamp (not `Timestamp.now() + 1 month`). */
function addOneMonthTimestamp() {
  return Timestamp.fromDate(moment.tz(tz).add(1, "month").toDate());
}

const rechargeNgosSubscriptionFees = async () => {
  console.log("running this cron job");
  const dayStart = moment.tz(tz).startOf("day").toDate();
  const dayEndExclusive = moment.tz(tz).startOf("day").add(1, "day").toDate();

  // Cannot combine `plan != …` with a range on `subscription.nextChargeAt`; filter plan in JS.
  const snapshot = await db
    .collection("ngos")
    .where("subscription.nextChargeAt", ">=", Timestamp.fromDate(dayStart))
    .where(
      "subscription.nextChargeAt",
      "<",
      Timestamp.fromDate(dayEndExclusive),
    )
    .get();

  console.log(
    "NGOs with nextChargeAt on this calendar day (%s): %s",
    tz,
    snapshot.docs.length,
  );

  const batch = db.batch();
  let opCount = 0;

  for (const document of snapshot.docs) {
    const plan = document.get("plan");
    if (String(plan ?? "").toLowerCase() === "free") continue;

    const ngoData = document.data();
    if (!ngoData.chargeAuthCode) {
      console.log(
        `we could not charge ${ngoData.ngoName} because they do not have a chargeAuthCode`,
      );
      const ref = db.collection("ngos").doc(ngoData.id);
      batch.update(ref, { plan: "free", "subscription.plan": "free" }); // reverts to free plan
      // this could happen because the user had not put their card details in yet
      continue;
    }

    const authCodePlain = crypto.AES.decrypt(
      ngoData.chargeAuthCode,
      process.env.CRYPTO_SECRET_KEY,
    ).toString(crypto.enc.Utf8);

    const billingEmail = ngoData.email;
    const amount = ngoData?.plan === "silver" ? subscriptionValues.SILVER : 0;
    const amountInKobo = amount * 100;

    try {
      await axios.post(
        `${PAYSTACK_API_URL}/transaction/charge_authorization`,
        {
          authorization_code: authCodePlain,
          email: billingEmail,
          amount: amountInKobo,
          currency: ngoData.subscription?.currency ?? "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      console.log(
        `charged ${ngoData.ngoName} - ${amount} for renewing subscription`,
      );

      const ref = db.collection("ngos").doc(document.id);
      const chargedAt = Timestamp.now();
      const nextBilling = addOneMonthTimestamp();

      batch.update(ref, {
        "subscription.currentPeriodEnd": nextBilling,
        "subscription.lastChargedAt": chargedAt,
        "subscription.nextChargeAt": nextBilling,
      });
      opCount += 1;
    } catch {
      console.log(`error charging ${ngoData.ngoName}`);
    }
  }

  if (opCount > 0) await batch.commit();

  return { charged: opCount };
};

module.exports = {
  rechargeNgosSubscriptionFees,
};
