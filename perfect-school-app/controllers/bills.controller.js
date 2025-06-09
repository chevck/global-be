const billsModel = require("../models/bills.model");
const logsController = require("../controllers/logs.controller");
const studentModel = require("../models/student.model");

module.exports = {
  create: async (req, res) => {
    try {
      const body = {
        schoolId: req.user.id,
        ...req.body,
        studentId: req.body.student,
      };
      console.log({ body });
      let bill = new billsModel({ ...body });
      bill = await bill.save();
      const student = studentModel.findById(body.studentId);
      logsController.create(req, {
        action: `Bill created for ${student.name} `,
        actionType: "create",
      });
      return res.status(201).json({ ...bill._doc });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to create a bill document",
        error,
      });
    }
  },

  stats: async (req, res) => {
    try {
      const query = {};
      if (req.query.term) query.term = req.query.term.toLowerCase();
      if (req.query.session) query.session = req.query.session.toLowerCase();
      if (req.query.paymentStatus.toLowerCase() === "unpaid")
        query.paidStatus = false;
      if (req.query.paymentStatus.toLowerCase() === "paid")
        query.paidStatus = true;
      const [totalBillsCount, totalUnpaidBills, totalPaidBills, totalBills] =
        await Promise.all([
          billsModel.countDocuments({ schoolId: req.user.id, ...query }),
          billsModel.find({
            schoolId: req.user.id,
            paidStatus: false,
            ...query,
          }),
          billsModel.find({
            schoolId: req.user.id,
            paidStatus: true,
            ...query,
          }),
          billsModel.find({ schoolId: req.user.id, ...query }),
        ]);
      return res.status(200).json({
        totalUnpaidBills,
        totalBillsCount,
        totalUnpaidBillsAmount: totalUnpaidBills.reduce(
          (acc, curr) => acc + curr?.totalAmount || 0,
          0
        ),
        totalPaidBillsAmount: totalPaidBills.reduce(
          (acc, curr) => acc + curr?.totalAmount || 0,
          0
        ),
        totalBillsAmount: totalBills.reduce(
          (acc, curr) => acc + curr?.totalAmount || 0,
          0
        ),
      });
    } catch (error) {
      console.log({ error }, "creating stats");
      return res.status(500).json({
        message: "Failed to get all bills",
        error,
      });
    }
  },

  fetchAll: async (req, res) => {
    try {
      let query = {};
      if (req.query.term) query.term = req.query.term;
      if (req.query.session) query.session = req.query.session;
      if (req.query.paymentStatus.toLowerCase() === "unpaid")
        query.paidStatus = false;
      if (req.query.paymentStatus.toLowerCase() === "paid")
        query.paidStatus = true;
      if (req.query.searchText) {
        const searchText = req.query.searchText.toLowerCase();
        query.$or = [
          // { studentId: { $regex: searchText } },
          { billId: { $regex: searchText } },
        ];
      }

      const docs = await billsModel
        .find({ schoolId: req.user.id, ...query })
        .populate("studentId")
        .sort("-createdAt");
      return res.status(200).json({ bills: docs });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to get all bills",
        error,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const billDoc = await billsModel.findOne({
        _id: req.params.id,
        schoolId: req.user.id,
      });
      if (!billDoc)
        return res
          .status(404)
          .json({ message: "Failed to find this bill document" });
      logsController.create(req, {
        action: `Deleted bill ${billDoc.billId}`,
        actionType: "create",
      });
      await billsModel.findByIdAndDelete(req.params.id);
      return res.status(200).send({ message: "Successfully deleted bill" });
    } catch (error) {
      console.log("dfs", error);
    }
  },

  fetchBill: async (req, res) => {
    try {
      console.log("ss", req.params);
      const bill = await billsModel.findOne({
        schoolId: req.user.id,
        _id: req.params.id,
      });
      if (!bill)
        return res.status(400).json({
          message:
            "This bill document does not exist in our records. Please contact admin",
        });
      return res.status(200).json({ bill });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to get bill",
        error,
      });
    }
  },

  update: async (req, res) => {
    try {
      const billDoc = await billsModel.findOne({ _id: req.params.id });
      if (!billDoc) {
        return res
          .status(404)
          .send({ message: "Failed to find this bill document. Cannot edit!" });
      }
      logsController.create(req, {
        action: `Updated bill ${billDoc.billId}`,
        actionType: "create",
      });
      const updateDoc = await billsModel.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { ...req.body }
      );
      return res.status(200).json({ updateDoc });
    } catch (error) {
      console.log("sdsd", error);
      return res.status(500).json({
        message: "Failed to update a bill document",
        error,
      });
    }
  },
};
