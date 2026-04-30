const axios = require("axios");
const crypto = require("crypto-js");
const PAYSTACK_API_URL = "https://api.paystack.co";
const firebaseUtils = require("../utils/firebase");

module.exports = {
  verifyPaymentTransaction: async (req, res) => {
    if (!req?.body?.paymentReference || !req?.body?.customerID)
      return res.status(400).send({
        message: "Payment Reference and Customer ID values are required",
      });
    try {
      const { paymentReference } = req.body;
      const verifyData = await axios.get(
        `${PAYSTACK_API_URL}/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      if (!verifyData?.data?.status)
        return res.status(400).send({
          message:
            "This payment could not be verified at the moment, please try again later",
        });
      await firebaseUtils.db
        .collection("ngos")
        .doc(req.body.customerID)
        .update({
          chargeAuthCode: crypto.AES.encrypt(
            verifyData?.data?.data?.authorization?.authorization_code,
            process.env.CRYPTO_SECRET_KEY,
          ).toString(),
        });
      return res.status(200).send({ message: "Successfully verified payment" });
    } catch (error) {
      console.log("error verifying payment transactions", error);
      return res.status(error?.status ?? 500).send({
        message:
          error?.data?.message ?? "Could not verify payment. Try again later",
      });
    }
  },

  getAllBanks: async (req, res) => {
    // fetch banks from paystack
    try {
      const response = await axios.get(
        `${PAYSTACK_API_URL}/bank?pay_with_bank_transfer=true`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      return res
        .status(200)
        .send({ banks: response?.data?.data, message: "Banks retrieved" });
    } catch (error) {
      console.log("errorrr - we couldnt get banks from paystack");
      res.status(400).send({
        message:
          "Error, unable to get banks at the moment. Please try again later",
      });
    }
  },

  autoChargeCard: async () => {
    // TODO: Get the customer ID, confirm that their subscription is finished and recharge using the authorization code (that will be decrypted)

    const res = await axios.post(
      `${PAYSTACK_API_URL}/transaction/charge_authorization`,
      { authorization_code: "", email: "", amount: 0 },
    );
  },
};
