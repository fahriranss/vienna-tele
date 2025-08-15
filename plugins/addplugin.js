const fs = require("fs");
const path = require("path");
const settings = require('../settings');

let handler = async (m, { vienna, text }) => {
    const ownerId = String(settings.adminId);
    const userId = String(m.from.id);

    if (userId !== ownerId) {
        return vienna.sendMessage(m.chat, { text: "❌ Kamu tidak punya izin untuk menambahkan plugin." });
    }

    const [fileName, ...codeParts] = text.split(" ");
    if (!fileName || codeParts.length === 0) {
        return vienna.sendMessage(m.chat, { text: "📌 Contoh: `/addplug namafile.js <kode plugin>`" }, { parse_mode: "Markdown" });
    }

    if (!fileName.endsWith(".js")) {
        return vienna.sendMessage(m.chat, { text: "❌ Nama file harus berakhiran `.js`" });
    }

    const code = codeParts.join(" ");
    const pluginPath = path.join(__dirname, fileName);

    try {
        fs.writeFileSync(pluginPath, code, "utf8");
        vienna.sendMessage(m.chat, { text: `✅ Plugin \`${fileName}\` berhasil ditambahkan.` }, { parse_mode: "Markdown" });
    } catch (err) {
        console.error(err);
        vienna.sendMessage(m.chat, { text: "❌ Terjadi kesalahan saat menyimpan plugin." });
    }
};

handler.command = ["addplug", "addplugin"];
handler.tags = ["owner"];
handler.help = ["addplug *namafile.js* <kode>"];

module.exports = handler;
