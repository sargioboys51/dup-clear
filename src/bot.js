const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { removeDuplicates } = require('./utils');

// Telegram Bot Token
const token = '7924174398:AAFzyV6zyhikX-Nsmw-5f-qvPVqiKmrblbU';
const bot = new TelegramBot(token, { polling: false });  // Use webhook instead of polling

// Webhook Setup with Express
const app = express();
const webhookUrl = 'https://your-vercel-app-url.com/webhook'; // Replace with your Vercel URL

// Set webhook for Telegram
bot.setWebHook(webhookUrl);

// Webhook endpoint for incoming updates
app.use(express.json());
app.post('/webhook', (req, res) => {
    const update = req.body;
    const chatId = update.message.chat.id;

    if (update.message.text === '/start') {
        bot.sendMessage(chatId, 'Welcome! Please send a .txt or .csv file to clean duplicates.');
    } else if (update.message.document) {
        const fileId = update.message.document.file_id;
        const fileName = update.message.document.file_name;

        bot.downloadFile(fileId, 'data/').then((filePath) => {
            const inputPath = path.join('data', filePath);
            const outputPath = `data/cleaned_${Date.now()}_${fileName}`;

            bot.sendMessage(chatId, 'Received file! Cleaning process started...');

            removeDuplicates(inputPath, outputPath, chatId)
                .then(() => {
                    bot.sendDocument(chatId, outputPath, {}, { caption: 'Here is your cleaned file!' });
                    fs.unlinkSync(inputPath); // Clean up original file
                    fs.unlinkSync(outputPath); // Clean up after sending
                })
                .catch((err) => {
                    bot.sendMessage(chatId, 'An error occurred while cleaning the file.');
                    console.error(err);
                });
        }).catch((err) => {
            bot.sendMessage(chatId, 'Failed to download the file.');
            console.error(err);
        });
    }

    res.sendStatus(200);  // Respond with a 200 status to Telegram
});

// Start Express server for webhook
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
