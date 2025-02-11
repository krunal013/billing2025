const express = require("express");
const router = express.Router();
const User = require("../models/user");
const FIXED_USER_ID = "67aaf62eda565a33cd0fb392"; //TEMP USE

router.get("/fees", async (req, res) => {
  try {
    // Fetch the single user
    const user = await User.findById(FIXED_USER_ID).select(
      "professionalfees riembursementfees"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      professionalFees: user.professionalfees,
      reimbursementFees: user.riembursementfees,
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Add new fees (this route assumes that each fee entry is a new item to add)
router.post("/add_expense", async (req, res) => {
  try {
    const { professionalfees, riembursementfees } = req.body;

    // Validate that the fee arrays are valid
    if (!Array.isArray(professionalfees) || !Array.isArray(riembursementfees)) {
      return res.status(400).json({ message: "Fees data should be an array" });
    }

    // Find the user and update their fees by pushing new items to the array
    const updatedUser = await User.findByIdAndUpdate(
      FIXED_USER_ID,
      {
        $push: {
          professionalfees: { $each: professionalfees },
          riembursementfees: { $each: riembursementfees },
        },
      },
      { new: true, runValidators: true }
    );

    console.log("Added 🟢")

    res.json({
      message: "New fees added successfully",
      professionalFees: updatedUser.professionalfees,
      reimbursementFees: updatedUser.riembursementfees,
    });
  } catch (error) {
    console.error("Error adding new fees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/remove_expense", async (req, res) => {
    try {
      const { professionalfees, riembursementfees } = req.body;
  
      // Validate that the fee arrays are valid
      if (!Array.isArray(professionalfees) || !Array.isArray(riembursementfees)) {
        return res.status(400).json({ message: "Fees data should be an array" });
      }
  
      // Find the user and update their fees by pulling items from the array
      const updatedUser = await User.findByIdAndUpdate(
        FIXED_USER_ID,
        {
          $pull: {
            professionalfees: { description: { $in: professionalfees.map(fee => fee.description) } },
            riembursementfees: { description: { $in: riembursementfees.map(fee => fee.description) } },
          },
        },
        { new: true, runValidators: true }
      );
  
      console.log("Removed 🔴");
  
      res.json({
        message: "Fees removed successfully",
        professionalFees: updatedUser.professionalfees,
        reimbursementFees: updatedUser.riembursementfees,
      });
    } catch (error) {
      console.error("Error removing fees:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

module.exports = router;
