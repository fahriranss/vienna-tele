// lib/adapter.js
module.exports = function createAdapter(bot, msg, match) {
    const chatId = msg.chat.id;

    const m = {
        chat: chatId,
        sender: msg.from.id,
        pushName: msg.from.first_name || 'User',
        text: msg.text || '',
        quoted: msg.reply_to_message || null,
        reply: (text, options = {}) => bot.sendMessage(chatId, text, { parse_mode: "Markdown", ...options })
    };

    const vienna = {
        sendMessage: (chat, content, options = {}) => {
            if (content.image) {
                return bot.sendPhoto(chat, content.image.url, { caption: content.caption || '', ...options });
            }
            if (content.audio) {
                return bot.sendAudio(chat, content.audio.url, { caption: content.caption || '', ...options });
            }
            if (typeof content === "string") {
                return bot.sendMessage(chat, content, options);
            }
        }
    };

    return { m, vienna, text: match ? match[1] : '', command: (msg.text || '').split(' ')[0].slice(1) };
};
