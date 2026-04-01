const express=require('express');
const router=express.Router();
const parser=require('body-parser');
require('dotenv').config();
router.post('/check', async (req, res) => {
    try {
        const { url } = req.body;

        // 1. Basic Validation (The "Guard")
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a URL to check." 
            });
        }

        // 2. Format Validation (Regex)
        const urlPattern = new RegExp(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/);
        if (!urlPattern.test(url)) {
            return res.status(422).json({ 
                success: false, 
                message: "That doesn't look like a valid URL structure." 
            });
        }

        // 3. The Analysis (Phase 1: Dummy/Placeholder)
        // Later, you will replace this with an actual API call (e.g., axios.get)
        console.log(`Analyzing: ${url}`);
        const isPhishing = false; // This is where your detection logic will live

        // 4. Send the Response (The "Verdict")
        res.status(200).json({
            success: true,
            url: url,
            isSafe: !isPhishing,
            threatLevel: isPhishing ? "High" : "None",
            scannedAt: new Date().toISOString()
        });

    } catch (error) {
        // Error Handling: Always catch unexpected crashes
        console.error("Error checking URL:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error. Please try again later." 
        });
    }
});