const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { removeDuplicates } = require('./utils');

// Telegram Bot Token
const token = '7924174398:AAFzyV6zyhikX-Nsmw-5f-qvPVqiKmrblbU';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! Send a .txt or .csv file to clean duplicates.');
});

bot.on('document', (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;

    bot.downloadFile(fileId, 'data/')
        .then((filePath) => {
            const inputPath = path.join('data', filePath);
            const outputPath = `data/cleaned_${Date.now()}_${msg.document.file_name}`;

            removeDuplicates(inputPath, outputPath)
                .then(() => {
                    bot.sendDocument(chatId, outputPath, {}, { caption: 'Here is your cleaned file!' });
                    fs.unlinkSync(inputPath); // Clean up original file
                    fs.unlinkSync(outputPath); // Clean up after sending
                })
                .catch(err => {
                    bot.sendMessage(chatId, 'An error occurred while cleaning the file.');
                    console.error(err);
                });
        })
        .catch(err => {
            bot.sendMessage(chatId, 'Failed to download the file.');
            console.error(err);
        });
});
