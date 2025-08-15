let handler = async (m, { vienna }) => {
    const image = 'https://files.catbox.moe/bgxlrc.jpg';
    const caption = `
*╭───────〔 𝐕𝐢𝐞𝐧𝐧𝐚 - 𝐀𝐈 〕───────╮*

❀ *Hai kak ${m.from.first_name}!*  
Aku *Vienna*, asisten AI lucu buatan Kak Fahri!  
Aku bisa bantu kamu dalam banyak hal loh!

─────────────

*❥ Developer:* Fahri  
*❥ Versi:* 1.0.0  
*❥ Created By:* @fahri_botz

─────────────

*› Command Menu*  
┗ /tiktok [link] – Download video TikTok  
┗ /sticker – Untuk membuat stiker   

*╰───────♡───────╯*
`.trim();

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '「 Owner 」', url: 'https://t.me/Fahri_botz' }
                ],
                [
                    { text: '「 Group 」', url: 'https://t.me/Ranss_official' }
                ]
            ]
        }
    };

    await vienna.sendPhoto(m.chat, image, {
        caption,
        parse_mode: "Markdown",
        ...keyboard
    });

    const audio = 'https://files.catbox.moe/49leag.mp3';
    await vienna.sendAudio(m.chat, audio);
};

handler.command = ["start"];
handler.tags = ["main"];
handler.help = ["start"];

module.exports = handler;
