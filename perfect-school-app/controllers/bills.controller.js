const billsModel = require("../models/bills.model");
const logsController = require("../controllers/logs.controller");
const studentModel = require("../models/student.model");
const mongoose = require("mongoose");

module.exports = {
  create: async (req, res) => {
    try {
      const schoolId = req.user.id;
      const { student, studentId, students, studentIds, ...rest } = req.body;

      // Backward compatible inputs:
      // - `student` / `studentId`: single student id
      // - `students` / `studentIds`: array of student ids
      const requestedStudentIdsRaw = [
        ...(Array.isArray(studentIds) ? studentIds : []),
        ...(Array.isArray(students) ? students : []),
        studentId,
        student,
      ].filter(Boolean);

      let recipients;
      if (requestedStudentIdsRaw.length > 0) {
        recipients = await studentModel
          .find({
            _id: { $in: requestedStudentIdsRaw },
            schoolId,
          })
          .select("_id name");
      } else {
        // If no explicit students were provided, share with all students in the class.
        recipients = await studentModel
          .find({ schoolId, class: rest.class })
          .select("_id name");
      }

      const recipientIds = recipients.map((s) => s._id);

      let bill = new billsModel({
        schoolId,
        ...rest,
        sharedWithStudents: recipientIds,
      });
      bill = await bill.save();

      if (recipientIds.length > 0) {
        await studentModel.updateMany(
          { _id: { $in: recipientIds }, schoolId },
          { $addToSet: { bills: bill._id } },
        );
      }

      logsController.create(req, {
        action: `Bill ${bill.billId} shared with ${recipientIds.length} student(s)`,
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

  share: async (req, res) => {
    try {
      const schoolId = req.user.id;

      const { studentId, students, studentIds, billId } = req.body;
      const requestedStudentIdsRaw = [
        ...(Array.isArray(studentIds) ? studentIds : []),
        ...(Array.isArray(students) ? students : []),
        studentId,
      ].filter(Boolean);

      if (!requestedStudentIdsRaw.length) {
        return res.status(400).json({
          message: "Please provide at least one studentId to share this bill.",
        });
      }

      const billQuery = { schoolId };
      if (req.params?.id) billQuery._id = req.params.id;
      else if (billId) billQuery.billId = billId;
      else {
        return res.status(400).json({
          message: "Please provide bill id in params or billId in body.",
        });
      }

      const bill = await billsModel
        .findOne(billQuery)
        .select("_id billId class term session totalAmount");
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const recipients = await studentModel
        .find({
          _id: { $in: requestedStudentIdsRaw },
          schoolId,
        })
        .select("_id name studentId class parents")
        .populate({ path: "parents", select: "_id email" });

      if (!recipients.length) {
        return res.status(404).json({
          message: "No matching students found to share this bill with.",
        });
      }

      const mismatchedClass = recipients.find((s) => s.class !== bill.class);
      if (mismatchedClass) {
        return res.status(400).json({
          message: `Cannot share bill to student in a different class.`,
          details: {
            billClass: bill.class,
            studentId: mismatchedClass._id,
            studentClass: mismatchedClass.class,
          },
        });
      }

      const missingParentEmail = recipients.find((s) => {
        const parents = Array.isArray(s.parents) ? s.parents : [];
        return !parents.some(
          (p) => typeof p?.email === "string" && p.email.trim().length > 0,
        );
      });
      if (missingParentEmail) {
        return res.status(400).json({
          message:
            "Cannot share bill because a student's parent does not have an email.",
          details: { studentId: missingParentEmail._id },
        });
      }

      const recipientIds = recipients.map((s) => s._id);

      // Validate first, then write. Use a transaction when supported so we don't partially apply.
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await Promise.all([
          billsModel.updateOne(
            { _id: bill._id, schoolId },
            { $addToSet: { sharedWithStudents: { $each: recipientIds } } },
            { session },
          ),
          studentModel.updateMany(
            { _id: { $in: recipientIds }, schoolId },
            { $addToSet: { bills: bill._id } },
            { session },
          ),
        ]);
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }

      logsController.create(req, {
        action: `Bill ${bill.billId} shared with ${recipientIds.length} student(s)`,
        actionType: "create",
      });

      return res.status(200).json({
        billId: bill.billId,
        billMongoId: bill._id,
        sharedCount: recipientIds.length,
        studentIds: recipientIds,
        billSummary: {
          class: bill.class,
          term: bill.term,
          session: bill.session,
          totalAmount: bill.totalAmount,
        },
      });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to share bill",
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
          0,
        ),
        totalPaidBillsAmount: totalPaidBills.reduce(
          (acc, curr) => acc + curr?.totalAmount || 0,
          0,
        ),
        totalBillsAmount: totalBills.reduce(
          (acc, curr) => acc + curr?.totalAmount || 0,
          0,
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
      if (req.query?.paymentStatus?.toLowerCase() === "unpaid")
        query.paidStatus = false;
      if (req.query?.paymentStatus?.toLowerCase() === "paid")
        query.paidStatus = true;    ` `
      // If `studentId` (Student.studentId) is provided, return bills shared with that student.
      if (req?.query?.studentId) {
        const student = await studentModel
          .findOne({ _id: req.query.studentId, schoolId: req.user.id })
          .select("_id");
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        query.sharedWithStudents = student._id;
      }
      if (req.query.searchText) {
        const searchText = req.query.searchText.toLowerCase();
        query.$or = [
          // { studentId: { $regex: searchText } },
          { billId: { $regex: searchText } },
        ];
      }

      const docs = await billsModel
        .find({ schoolId: req.user.id, ...query })
        // .populate("studentId")
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
      if (billDoc.sharedWithStudents?.length) {
        await studentModel.updateMany(
          { _id: { $in: billDoc.sharedWithStudents }, schoolId: req.user.id },
          { $pull: { bills: billDoc._id } },
        );
      }
      await billsModel.findByIdAndDelete(req.params.id);
      return res.status(200).send({ message: "Successfully deleted bill" });
    } catch (error) {
      console.log("dfs", error);
    }
  },

  fetchBill: async (req, res) => {
    try {
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
        { ...req.body },
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
