const fs = require('fs');
const readline = require('readline');

// Function to remove duplicates from large files efficiently
function removeDuplicates(inputPath, outputPath, chatId) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
        const writeStream = fs.createWriteStream(outputPath);
        const rl = readline.createInterface({
            input: readStream,
            output: writeStream,
            terminal: false
        });

        const seen = new Set();
        let totalLines = 0;
        let processedLines = 0;

        rl.on('line', (line) => {
            totalLines++;
            const match = line.match(/([a-zA-Z0-9._%+-]+):([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)(?=:)/);
            
            if (match) {
                const entry = match[1] + ':' + match[2];
                if (!seen.has(entry)) {
                    seen.add(entry);
                    writeStream.write(line + '\n');
                }
            }

            processedLines++;
            // Send progress updates after every 1000 lines processed
            if (processedLines % 1000 === 0) {
                sendProgressUpdate(`Processing: ${processedLines}/${totalLines} lines...`, chatId);
            }
        });

        rl.on('close', () => {
            sendProgressUpdate('Cleaning complete! Sending back your cleaned file...', chatId);
            resolve();
        });

        rl.on('error', (err) => {
            reject(err);
        });
    });
}

function sendProgressUpdate(message, chatId) {
    bot.sendMessage(chatId, message);
}

module.exports = { removeDuplicates };
