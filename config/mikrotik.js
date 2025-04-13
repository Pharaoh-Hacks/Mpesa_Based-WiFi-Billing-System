require("dotenv").config();
const { RouterOSClient } = require("node-routeros");

const connectToMikrotik = async () => {
    const client = new RouterOSClient([
        process.env.MIKROTIK_HOST,
        process.env.MIKROTIK_USER,
        process.env.MIKROTIK_PASS
    ]);

    await client.connect();
    return client;
};

const whitelistMAC = async (mac, time) => {
    const durationMap = {
        "1Hr": "1h",
        "4Hrs": "4h",
        "12Hrs": "12h",
        "24Hrs": "1d"
    };

    const duration = durationMap[time];

    if (!duration) return { success: false, message: "Invalid duration" };

    try {
        const client = await connectToMikrotik();

        // Add MAC to bypass IP binding
        await client.write([
            "/ip/hotspot/ip-binding/add",
            `=mac-address=${mac}`,
            "=type=bypassed",
            `=comment=WiFi-Paid-${duration}`
        ]);

        await client.close();
        return { success: true, message: `MAC ${mac} whitelisted for ${duration}` };

    } catch (error) {
        console.error("MikroTik Error:", error);
        return { success: false, message: "MikroTik whitelist failed" };
    }
};

module.exports = { whitelistMAC };
