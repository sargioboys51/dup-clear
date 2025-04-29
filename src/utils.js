const fs = require('fs');

// Function to remove duplicates based on username:password pair
function removeDuplicates(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(inputPath, 'utf8', (err, data) => {
            if (err) return reject(err);
            
            const lines = data.split('\n').map(line => line.trim());
            const uniqueEntries = new Set();

            const cleanedLines = lines.filter(line => {
                const match = line.match(/([a-zA-Z0-9._%+-]+):([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)(?=:)/);
                if (match && !uniqueEntries.has(match[1] + match[2])) {
                    uniqueEntries.add(match[1] + match[2]);
                    return true;
                }
                return false;
            });

            const cleanedData = cleanedLines.join('\n');
            fs.writeFile(outputPath, cleanedData, 'utf8', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

module.exports = { removeDuplicates };
