const Meeting = require("../../model/schema/meeting.js");
const mongoose = require("mongoose");
const User = require('../../model/schema/user');

// Try different possible paths for the mail utility
let sendEmail;
try {
    // First try the utils directory
    const mailUtil = require('../../utils/mail');
    sendEmail = mailUtil.sendEmail;
} catch (e) {
    try {
        // Then try the root directory
        const mailUtil = require('../../mail');
        sendEmail = mailUtil.sendEmail;
    } catch (e) {
        // If both fail, create a dummy function to prevent errors
        console.warn("Mail utility not found, email notifications will be disabled");
        sendEmail = async () => console.log("Email sending is disabled");
    }
}

const index = async (req, res) => {
    const query = { ...req.query, deleted: false };

    try {
        // Check if user is superAdmin
        const user = await User.findById(req.user.userId);

        // If not superAdmin, limit to meetings created by or assigned to user
        if (user?.role !== "superAdmin") {
            delete query.createBy;
            query.$or = [
                { createBy: new mongoose.Types.ObjectId(req.user.userId) },
                { assignedTo: new mongoose.Types.ObjectId(req.user.userId) },
                { participants: new mongoose.Types.ObjectId(req.user.userId) }
            ];
        }

        // Perform aggregation with lookup to related collections
        let result = await Meeting.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "assignedUser",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "modifiedBy",
                    foreignField: "_id",
                    as: "modifiedByUser",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$modifiedByUser", preserveNullAndEmptyArrays: true } },
            { $match: { "users.deleted": { $ne: true } } },
            {
                $addFields: {
                    createdByName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
                    assignedToName: { $concat: ["$assignedUser.firstName", " ", "$assignedUser.lastName"] },
                    modifiedByName: { $concat: ["$modifiedByUser.firstName", " ", "$modifiedByUser.lastName"] },
                }
            },
            { $project: { users: 0, assignedUser: 0, modifiedByUser: 0 } },
        ]);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in meetings index:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const add = async (req, res) => {
    try {
        const newMeeting = new Meeting({
            ...req.body,
            createBy: req.user.userId
        });

        await newMeeting.save();

        // Handle email notifications if enabled
        if (req.body.sendNotifications && req.body.participantEmails && typeof sendEmail === 'function') {
            try {
                const emailSubject = `Meeting Invitation: ${newMeeting.title}`;
                const emailText = `You have been invited to a meeting: ${newMeeting.title}\nDate: ${new Date(newMeeting.startDate).toLocaleString()} - ${new Date(newMeeting.endDate).toLocaleString()}\nLocation: ${newMeeting.location || 'Not specified'}\nDescription: ${newMeeting.description || 'No description provided'}`;

                for (const email of req.body.participantEmails) {
                    try {
                        await sendEmail(email, emailSubject, emailText, emailText.replace(/\n/g, '<br>'));
                    } catch (emailError) {
                        console.error(`Failed to send email to ${email}:`, emailError);
                        // Continue with other emails even if one fails
                    }
                }
            } catch (emailError) {
                console.error("Email notification error:", emailError);
                // Continue without failing the meeting creation
            }
        }

        res.status(201).json(newMeeting);
    } catch (err) {
        console.error("Failed to create meeting:", err);
        res.status(400).json({ error: "Failed to create meeting" });
    }
};

const view = async (req, res) => {
    try {
        let meeting = await Meeting.findOne({ _id: req.params.id, deleted: false });

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found." });
        }

        let result = await Meeting.aggregate([
            { $match: { _id: meeting._id } },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "assignedUser",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "modifiedBy",
                    foreignField: "_id",
                    as: "modifiedByUser",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participantUsers",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$modifiedByUser", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
                    assignedToName: { $concat: ["$assignedUser.firstName", " ", "$assignedUser.lastName"] },
                    modifiedByName: { $concat: ["$modifiedByUser.firstName", " ", "$modifiedByUser.lastName"] },
                    participantNames: {
                        $map: {
                            input: "$participantUsers",
                            as: "participant",
                            in: {
                                _id: "$$participant._id",
                                name: { $concat: ["$$participant.firstName", " ", "$$participant.lastName"] }
                            }
                        }
                    }
                }
            },
            { $project: { users: 0, assignedUser: 0, modifiedByUser: 0, participantUsers: 0 } },
        ]);

        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Error retrieving meeting:", err);
        res.status(500).json({ error: "Error retrieving meeting" });
    }
};

const edit = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            modifiedBy: req.user.userId,
            updatedAt: Date.now()
        };

        const result = await Meeting.findOneAndUpdate(
            { _id: req.params.id, deleted: false },
            { $set: updateData },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Meeting not found or already deleted" });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Failed to update meeting:", err);
        res.status(400).json({ error: "Failed to update meeting" });
    }
};

const addMany = async (req, res) => {
    try {
        const meetings = req.body.map(meeting => ({
            ...meeting,
            createBy: req.user.userId
        }));

        const inserted = await Meeting.insertMany(meetings);

        res.status(201).json(inserted);
    } catch (err) {
        console.error('Failed to create multiple meetings:', err);
        res.status(400).json({ error: 'Failed to create meetings' });
    }
};

const deleteData = async (req, res) => {
    try {
        const result = await Meeting.findByIdAndUpdate(
            req.params.id,
            {
                deleted: true,
                modifiedBy: req.user.userId,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ message: "Meeting removed successfully", result });
    } catch (err) {
        console.error("Error deleting meeting:", err);
        res.status(500).json({ message: "Error deleting meeting", error: err });
    }
};

const deleteMany = async (req, res) => {
    try {
        const result = await Meeting.updateMany(
            { _id: { $in: req.body }, deleted: false },
            {
                $set: {
                    deleted: true,
                    modifiedBy: req.user.userId,
                    updatedAt: Date.now()
                }
            }
        );

        if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
            return res.status(200).json({
                message: `${result.modifiedCount} meetings removed successfully`,
                result
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No meetings found or deleted"
            });
        }
    } catch (err) {
        console.error("Error deleting multiple meetings:", err);
        return res.status(500).json({
            success: false,
            message: "Error deleting meetings",
            error: err
        });
    }
};

module.exports = { index, add, edit, addMany, view, deleteData, deleteMany };