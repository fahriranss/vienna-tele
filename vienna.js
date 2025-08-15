const fs = require('fs');
const path = require('path');
const createAdapter = require('./lib/adapter');

function registerFeatures(bot) {
    const pluginPath = path.join(__dirname, 'plugins');

    if (!fs.existsSync(pluginPath)) {
        console.warn('⚠️ Folder "plugins/" tidak ditemukan.');
        return;
    }

    fs.readdirSync(pluginPath).forEach(file => {
        if (!file.endsWith('.js')) return;

        try {
            const plugin = require(path.join(pluginPath, file));

            // Cek apakah plugin punya handler.command
            const commands = plugin.command || plugin.handler?.command || [];
            if (!Array.isArray(commands) || commands.length === 0) {
                console.warn(`⚠️ Plugin ${file} tidak memiliki "handler.command"`);
                return;
            }

            commands.forEach(cmd => {
                const regex = new RegExp(`^/${cmd}(?:\\s+)?(.+)?`, 'i');

                bot.onText(regex, (msg, match) => {
                    const { m, vienna, text, command } = createAdapter(bot, msg, match);

                    // Jalankan plugin
                    try {
                        if (typeof plugin === 'function') {
                            plugin(m, { vienna, text, command });
                        } else if (typeof plugin.handler === 'function') {
                            plugin.handler(m, { vienna, text, command });
                        } else {
                            console.warn(`⚠️ Plugin ${file} tidak punya fungsi handler`);
                        }
                    } catch (err) {
                        console.error(`❌ Error di plugin ${file}: ${err.message}`);
                        m.reply("⚠️ Terjadi kesalahan saat menjalankan perintah.");
                    }
                });
            });

            console.log(`✅ Plugin loaded: ${file}`);
        } catch (err) {
            console.error(`❌ Gagal memuat plugin ${file}:`, err.message);
        }
    });
}

module.exports = { registerFeatures };
