const settings = require('../settings');

let handler = async (m, { vienna }) => {
    const ownerId = String(settings.adminId);
    const userId = String(m.from.id);


    const text = `
*╭───〔 Owner Menu 〕───╮*

/addplug <nama> <kode> – Tambah plugin
/delplug <nama> – Hapus plugin
/listplug – Lihat semua plugin
/getplugin <nama> – Ambil file plugin

*╰───────────────╯*
`.trim();

    await vienna.sendMessage(m.chat, { text }, { parse_mode: "Markdown" });
};

handler.command = ["ownermenu"];
handler.tags = ["owner"];
handler.help = ["ownermenu"];

module.exports = handler;
