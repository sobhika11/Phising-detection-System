const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.post('/api/check-url', (req, res) => {
    const { url } = req.body;
    console.log(`Received URL for checking: ${url}`);
    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }
    res.json({
        receivedUrl: url,
        status: "Safe",
        message: "Initial check complete. Dummy response active."
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});