const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { removeDuplicates } = require('./utils');
const { sendProgressUpdate } = require('./bot');

const app = express();
const dataDir = path.join(__dirname, 'data');

// Create the "data" folder if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const upload = multer({ dest: dataDir });

app.use(express.static('public'));

// Route for file upload and cleaning
app.post('/upload', upload.single('file'), async (req, res) => {
    const { filename, path: filePath } = req.file;
    const outputPath = path.join(dataDir, `cleaned_${Date.now()}_${filename}`);
    
    sendProgressUpdate('File uploaded. Cleaning process started...', req.body.telegramId);

    try {
        await removeDuplicates(filePath, outputPath, req.body.telegramId); // Pass telegramId for progress updates
        res.download(outputPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error processing file.');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error cleaning file.');
    }
});

// Root route to serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
