
const router = require("express").Router();

const User = require("../models/user");
const List = require("../models/list");


// ===============================
// CREATE TASK
// ===============================

router.post("/addTask", async (req, res) => {
    try {
        const { title, body, email } = req.body;

        // Find user
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Create new task
        const list = new List({
            title,
            body,
            user: existingUser._id
        });

        // Save task
        await list.save();

        // Add task to user's list
        existingUser.list.push(list._id);

        // Save user
        await existingUser.save();

        // Send response
        res.status(200).json({
            message: "Task added successfully",
            list
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ===============================
// GET ALL TASKS FOR USER
// ===============================

router.get("/getTask/:email", async (req, res) => {
    try {
        const { email } = req.params;

        // Find user
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Find all tasks for this user
        const tasks = await List.find({
            user: existingUser._id
        });

        // Send response
        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ===============================
// GET SINGLE TASK
// ===============================

router.get("/getTaskById/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find task by ID
        const task = await List.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Send response
        res.status(200).json({
            message: "Task fetched successfully",
            task
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ===============================
// UPDATE TASK
// ===============================

router.put("/updateTask/:id", async (req, res) => {
    try {
        const { title, body, email } = req.body;

        // Find user
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Update task
        const updatedList = await List.findOneAndUpdate(
            {
                _id: req.params.id,
                user: existingUser._id
            },
            {
                title,
                body
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Check task exists
        if (!updatedList) {
            return res.status(404).json({
                message: "Task not found or unauthorized"
            });
        }

        // Send response
        res.status(200).json({
            message: "Task updated successfully",
            updatedList
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ===============================
// DELETE TASK
// ===============================

router.delete("/deleteTask/:id", async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Delete only user's own task
        const deletedList = await List.findOneAndDelete({
            _id: req.params.id,
            user: existingUser._id
        });

        // Check task exists
        if (!deletedList) {
            return res.status(404).json({
                message: "Task not found or unauthorized"
            });
        }

        // Remove task from user's list
        existingUser.list = existingUser.list.filter(
            (taskId) => taskId.toString() !== req.params.id
        );

        // Save user
        await existingUser.save();

        // Send response
        res.status(200).json({
            message: "Task deleted successfully",
            deletedList
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;