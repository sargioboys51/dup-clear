const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { removeDuplicates } = require('./utils');
const { sendProgressUpdate } = require('./bot');

const app = express();
const dataDir = path.join(__dirname, 'data');

// Create "data" folder if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const upload = multer({ dest: dataDir });

// Root route to serve HTML page for manual file upload
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
