const {
  rechargeNgosSubscriptionFees,
} = require("../jobs/ngosPaidSubscriptionRenewal.job");

module.exports = {
  processExpiredPaidNgosRenewal: async (req, res) => {
    try {
      const summary = await rechargeNgosSubscriptionFees({
        now: new Date(),
      });
      return res.status(200).json({
        message: "NGO paid subscription renewal sweep finished.",
        ...summary,
      });
    } catch (error) {
      console.error("processExpiredPaidNgosRenewal", error);
      return res.status(500).json({
        message: error.message || "Renewal sweep failed.",
      });
    }
  },
};
