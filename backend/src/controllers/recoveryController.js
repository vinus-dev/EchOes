const jwt = require("jsonwebtoken");

/**
 * POST /auth/recovery/verify-qa
 * Verify security Q&A to start PIN recovery
 */
const verifyRecoveryQA = (req, res) => {
  const { answer } = req.body;

  if (!answer || answer.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Answer is required.",
    });
  }

  const correctAnswer = process.env.SECURITY_ANSWER || "gptvinu02_db_user";

  if (answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
    // Generate a temporary recovery token (valid for 10 minutes)
    const recoveryToken = jwt.sign(
      { recovery: true, type: "pin-recovery-qa" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      message: "Security answer verified.",
      recoveryToken,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Incorrect answer. Please try again.",
  });
};

/**
 * POST /auth/recovery/verify-password
 * Verify admin password for PIN recovery
 */
const verifyRecoveryPassword = (req, res) => {
  const { password, recoveryToken } = req.body;

  if (!recoveryToken) {
    return res.status(400).json({
      success: false,
      message: "Invalid recovery state. Please start over.",
    });
  }

  if (!password || password.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Password is required.",
    });
  }

  try {
    // Verify the recovery token
    const decoded = jwt.verify(recoveryToken, process.env.JWT_SECRET);
    if (!decoded.recovery || decoded.type !== "pin-recovery-qa") {
      return res.status(401).json({
        success: false,
        message: "Invalid recovery token.",
      });
    }

    const correctPassword = process.env.ADMIN_PASSWORD || "echoes@admin2024";

    if (password === correctPassword) {
      // Generate a new recovery token for PIN reset (valid for 5 minutes)
      const resetToken = jwt.sign(
        { recovery: true, type: "pin-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      return res.status(200).json({
        success: true,
        message: "Password verified.",
        resetToken,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Incorrect password. Please try again.",
    });
  } catch (error) {
    console.error("Recovery verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Recovery session expired. Please start over.",
    });
  }
};

module.exports = { verifyRecoveryQA, verifyRecoveryPassword };
