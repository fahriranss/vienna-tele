const fs = require("fs");
const path = require("path");
const settings = require('../settings');

let handler = async (m, { vienna, text }) => {
    const ownerId = String(settings.adminId);
    const userId = String(m.from.id);

    if (userId !== ownerId) {
        return vienna.sendMessage(m.chat, { text: "❌ Kamu tidak punya izin untuk mengambil plugin." });
    }

    if (!text) {
        return vienna.sendMessage(m.chat, { text: "📌 Contoh: `/getplugin namafile.js`" }, { parse_mode: "Markdown" });
    }

    const pluginPath = path.join(__dirname, text);

    if (!fs.existsSync(pluginPath)) {
        return vienna.sendMessage(m.chat, { text: "❌ Plugin tidak ditemukan." });
    }

    try {
        await vienna.sendDocument(m.chat, pluginPath, {}, { quoted: m });
    } catch (err) {
        console.error(err);
        vienna.sendMessage(m.chat, { text: "❌ Terjadi kesalahan saat mengirim plugin." });
    }
};

handler.command = ["getplugin"];
handler.tags = ["owner"];
handler.help = ["getplugin *namafile.js*"];

module.exports = handler;
