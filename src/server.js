const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { removeDuplicates } = require('./utils');

const app = express();
const upload = multer({ dest: 'data/' });

app.use(express.static('public'));

// Endpoint for file upload and cleaning
app.post('/upload', upload.single('file'), (req, res) => {
    const { filename, path: filePath } = req.file;
    const outputPath = `data/cleaned_${Date.now()}_${filename}`;
    
    removeDuplicates(filePath, outputPath)
        .then(() => {
            res.download(outputPath, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error processing file.');
                }
            });
        })
        .catch(err => {
            res.status(500).send('Error cleaning file.');
            console.error(err);
        });
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
