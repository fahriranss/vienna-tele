const fs = require("fs");
const path = require("path");
const settings = require('../settings');

let handler = async (m, { vienna }) => {
    const ownerId = String(settings.adminId);
    const userId = String(m.from.id);

    if (userId !== ownerId) {
        return vienna.sendMessage(m.chat, { text: "❌ Kamu tidak punya izin untuk melihat daftar plugin." });
    }

    const pluginDir = __dirname;
    let files;

    try {
        files = fs.readdirSync(pluginDir).filter(file => file.endsWith(".js"));
    } catch (err) {
        console.error("Gagal membaca folder plugin:", err);
        return vienna.sendMessage(m.chat, { text: "❌ Gagal membaca daftar plugin." });
    }

    if (files.length === 0) {
        return vienna.sendMessage(m.chat, { text: "🔍 Tidak ada plugin yang ditemukan." });
    }

    const list = files.map((f, i) => `${i + 1}. ${f}`).join("\n");
    const caption = `📦 *Daftar Plugin Saat Ini:*\n\n${list}`;

    vienna.sendMessage(m.chat, { text: caption }, { parse_mode: "Markdown" });
};

handler.command = ["listplug", "listplugin"];
handler.tags = ["owner"];
handler.help = ["listplug"];

module.exports = handler;
