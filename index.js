const TelegramBot = require('node-telegram-bot-api');
const settings = require('./settings');
const { registerFeatures } = require('./vienna');

// Ambil token bot dari settings.js
const botToken = settings.token;
const bot = new TelegramBot(botToken, { polling: true });

// Info saat bot aktif
console.log("✅ Bot Telegram telah berjalan!");

// Load semua plugin
registerFeatures(bot);

// Kirim notifikasi ke admin saat bot online
const admin = settings.adminId;
bot.sendMessage(admin, `🤖 Bot Vienna telah tersambung dan aktif!`);