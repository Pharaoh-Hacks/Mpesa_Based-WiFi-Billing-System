const express = require("express");
const db = require("../config/db");
const { whitelistMAC } = require("../config/mikrotik");

const router = express.Router();

router.post("/callback", (req, res) => {
    console.log("📲 M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));

    const callbackData = req.body.Body?.stkCallback;
    const transactionId = callbackData?.CheckoutRequestID;
    const resultCode = callbackData?.ResultCode;

    if (resultCode !== 0) {
        return res.json({ success: false, message: "Payment failed or canceled" });
    }

    const amount = callbackData.CallbackMetadata?.Item.find(item => item.Name === "Amount")?.Value;
    if (!amount || !transactionId) {
        return res.status(400).json({ error: "Invalid M-Pesa callback data" });
    }

    // Fetch MAC address from DB
    db.query("SELECT mac_address FROM payments WHERE transaction_id = ?", [transactionId], async (err, results) => {
        if (err || results.length === 0) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "MAC address not found for transaction" });
        }

        const mac = results[0].mac_address;
        let time = "1Hr";
        if (amount === 30) time = "24Hrs";
        else if (amount === 20) time = "12Hrs";
        else if (amount === 15) time = "4Hrs";

        console.log(`✅ Whitelisting MAC ${mac} for ${time}...`);

        const mikrotikResponse = await whitelistMAC(mac, time);

        if (mikrotikResponse.success) {
            db.query("UPDATE payments SET status = 'confirmed' WHERE transaction_id = ?", [transactionId]);
            return res.json({ success: true, message: mikrotikResponse.message });
        } else {
            console.error("❌ MikroTik Error:", mikrotikResponse.message);
            return res.status(500).json({ error: "MikroTik whitelist failed" });
        }
    });
});

module.exports = router;
