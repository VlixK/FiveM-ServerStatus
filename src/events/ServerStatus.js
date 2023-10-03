require('dotenv').config();
const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js')
const { defaultIP, FooterText, FooterImage1, FooterImage2, ThumnailImage1, ThumnailImage2, EmbedColour, TestMessageID, FiveMChannelID, FiveMMessageID, ServerMessageID, FiveMServerID1, FiveMServerID2, FiveMEmbedUpdateTime, LocationSaveIP, CustomIP } = process.env
const cfx = require('cfx-api');
const axios = require('axios');
const getIPJSON = require(`${LocationSaveIP}\\ipserver.json`);
let thumnailImage = 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png';
let footerImage = 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png';
let titleName = '```' + `               Thành Phố Mới           ` + '```';
let ip = defaultIP;
let ipconnect = defaultIP;
let timerStatus;
let timerMenu;
const timestamp = Date.now();
const date = new Date(timestamp);

function resetTimer() {
    clearTimeout(timerStatus);
    // clearTimeout(timerMenu);
}
module.exports = {
    resetTimer,
    name: 'ready',
    once: false,
    async execute(client) {
        // console.log(ip)

        if (getIPJSON.length > 0) {
            for (let i = 0; i < getIPJSON.length; i++) {
                if (ip == getIPJSON[i].ip) {
                    thumnailImage = getIPJSON[i].image;
                    footerImage = getIPJSON[i].image;
                    titleName = '```' + `               ${getIPJSON[i].svname}           ` + '```';
                    ipconnect = getIPJSON[i].ipconnect;
                }
            }
        }

        const liveServerStatus = async () => {

            if (FiveMChannelID !== '') {
                const liveChannelName = client.channels.cache.find(channel => channel.id == (FiveMChannelID));
                if (FiveMMessageID !== '') {
                    await axios.get(`https://servers-frontend.fivem.net/api/servers/single/${ip}`, {
                        headers: { "User-Agent": "cfx" },
                    })
                        .then(async (response) => {
                            // console.log(`SVSTT Vừa reset IP: ${ip}`);
                            var liveStatus = await cfx.fetchStatus()
                            var liveServer = await cfx.fetchServer(ip)
                            if (liveServer !== undefined) {
                                liveChannelName.messages.fetch(FiveMMessageID).then((message) => {

                                    const liveStatusMessage = new EmbedBuilder()
                                        // .setTitle(titleName)
                                        .setThumbnail(thumnailImage)
                                        .setColor(EmbedColour)
                                        .addFields(
                                            { name: ' ', value:`${titleName}`, inline: false },
                                            { name: '> **Đèn Thành Phố**', value: '```🟢 Sáng đèn```', inline: true },
                                            { name: '> Nguồn Điện', value: liveStatus.everythingOk ? "```🟢 Sáng đèn```" : "```⚠️ Sụp Nguồn```", inline: true },
                                            { name: '> Cư dân', value: "```" + `🌏 ${liveServer.playersCount} / ${liveServer.maxPlayers}` + "```", inline: true },

                                        )
                                        .setFooter({ text: `• Lần cập nhật cuối: `, iconURL: footerImage })
                                    .setTimestamp()

                                    if (getIPJSON.length > 0) {
                                        for (let i = 0; i < getIPJSON.length; i++) {
                                            if (ip === getIPJSON[i].ip) {
                                                if (getIPJSON[i].ipconnect){
                                                    liveStatusMessage.addFields ({ name: '> IP CONNECT', value: "```" + `connect ${getIPJSON[i].ipconnect}` + "```", inline: true })
                                                }else {
                                                    liveStatusMessage.addFields ({ name: '> IP CONNECT', value: "```" + `connect ${ip}` + "```", inline: true })
                                                }
                                            }
                                        }
                                    }

                                    // const buttons = [];
                                    const buttonShowPlayers = new ButtonBuilder()
                                        .setStyle('Primary')
                                        .setEmoji('🌏')

                                    if (getIPJSON.length > 0) {
                                        for (let i = 0; i < getIPJSON.length; i++) {
                                            if (ip === getIPJSON[i].ip) {
                                                buttonShowPlayers.setLabel(`Cư Dân ${getIPJSON[i].svname}`)
                                                buttonShowPlayers.setCustomId(`${getIPJSON[i].ip}`)
                                                // buttons.push(buttonShowPlayers);
                                            }

                                            // Nút Play cho server
                                            // if (ip === getIPJSON[i].ip) {
                                            //     const buttonPlay = new ButtonBuilder()
                                            //         .setStyle('Primary')
                                            //         .setEmoji(':popcornsnail:841325345776074753')
                                            //         .setLabel(`Vào ${getIPJSON[i].svname}`)
                                            //         .setCustomId(`play${getIPJSON[i].ip}`)
                                            //     buttons.push(buttonPlay);
                                            // }
                                        }

                                    }
                                    const btnShow = new ActionRowBuilder().addComponents(buttonShowPlayers);
                                    const ButtonDownload = new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setLabel('Tải Launcher')
                                                .setStyle('Link')
                                                .setEmoji(':nekosip:855175810821390398')
                                                .setURL(`https://github.com/VlixK/K-Launcher/releases/download/2.1.2/Home-Setup-2.1.2.exe`),
                                        );

                                    message.edit({ embeds: [liveStatusMessage], components: [ButtonDownload, btnShow] });
                                })
                                client.user?.setActivity(`[${liveServer.playersCount}/${liveServer.maxPlayers}]`, { type: ActivityType.Watching });
                            }
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 404) {
                                // Xử lý lỗi 404
                                console.log('Không tìm thấy trang');
                            } else {
                                // Xử lý các lỗi khác
                                console.log('Lỗi:', error.message);
                            }
                            liveChannelName.messages.fetch(FiveMMessageID).then((message) => {
                                const liveStatusMessage = new EmbedBuilder()
                                    .setThumbnail('https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png')
                                    .setColor('#a082ff')
                                    .addFields(
                                        { name: '• Đèn Thành Phố •', value: 'Offline ❌', inline: true },
                                        { name: '•  Trong Thành Phố •', value: `0/0`, inline: true },
                                        { name: '• Thời gian sửa •', value: `Anytime`, inline: true },
                                        { name: 'Người nhập vai:', value: `Không có để show`, inline: false },
                                    )
                                    .setFooter({ text: '• Lần cập nhật cuối: ', iconURL: footerImage })
                                    .setTimestamp()

                                const ButtonDownload = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel('Tải Launcher')
                                            .setStyle('Link')
                                            .setEmoji(':nekosip:855175810821390398')
                                            .setURL(`https://github.com/VlixK/K-Launcher/releases/download/2.1.2/Home-Setup-2.1.2.exe`),
                                    );

                                message.edit({ embeds: [liveStatusMessage], components: [ButtonDownload] });
                            })
                            client.user?.setActivity(`We Don't Hợp Nhao`, { type: ActivityType.Playing });
                        })
                    timerStatus = setTimeout(liveServerStatus, 1000 * parseInt(FiveMEmbedUpdateTime, 10));
                } else {
                    const Button = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Tải Launcher')
                                .setStyle('Link')
                                .setEmoji(':nekosip:855175810821390398')
                                .setURL(`https://github.com/VlixK/K-Launcher/releases/download/2.1.2/Home-Setup-2.1.2.exe`),
                        );

                    const exampleEmbed = new EmbedBuilder()
                        .setColor(EmbedColour)
                        .setDescription('• **Server Status** •')
                        .setThumbnail(ThumnailImage1)
                        .setTimestamp()
                        .setFooter({ text: FooterText, iconURL: FooterImage1 });
                    await liveChannelName.send({ embeds: [exampleEmbed], components: [Button] })
                }
            }
            else {
                console.log('Bạn chưa điền đầy đủ thông tin .env, Có thể: FiveMChannelID')
                return
            }
        }

        const selectServer = async () => {
            // console.log(`SVSTT MenuSV`)
            if (FiveMChannelID !== '') {
                const liveChannelName1 = client.channels.cache.find(channel => channel.id == (FiveMChannelID))
                if (ServerMessageID !== '') {

                    liveChannelName1.messages.fetch(ServerMessageID).then((message) => {
                        const selectMenuIP = new StringSelectMenuBuilder()
                            .setCustomId('selectIP')
                            .setPlaceholder('Chọn thành phố!!');

                        if (getIPJSON.length > 0) {
                            for (let i = 0; i < getIPJSON.length; i++) {
                                // console.log(i)
                                selectMenuIP.addOptions({
                                    label: getIPJSON[i].svname,
                                    value: getIPJSON[i].ip,
                                })
                            }
                        }

                        const setDefault = new ButtonBuilder()
                            .setLabel('Mặc Định Thành Phố Đang Chọn')
                            .setEmoji(':1_FrogeYes:854594245855281172')
                            .setStyle(ButtonStyle.Primary);
                        if (getIPJSON.length > 0) {
                            for (let i = 0; i < getIPJSON.length; i++) {
                                if (ip === getIPJSON[i].ip) {
                                    setDefault.setCustomId(`default${getIPJSON[i].ip}`);
                                    return;
                                } else {
                                    setDefault.setCustomId(`default${getIPJSON[0].ip}`);
                                    return;
                                }
                            }
                        }

                        const addIP = new ButtonBuilder()
                            .setLabel('Thêm Thành Phố Mới')
                            .setEmoji('a:p15:1068577256500367455')
                            .setStyle(ButtonStyle.Success)
                            .setCustomId('btnAdd');

                        const deleteIP = new ButtonBuilder()
                            .setLabel('Xóa Thành Phố')
                            .setEmoji('✖️')
                            .setStyle(ButtonStyle.Danger)
                        // .setCustomId('confirmDel')
                        if (getIPJSON.length > 0) {
                            for (let i = 0; i < getIPJSON.length; i++) {
                                if (ip === getIPJSON[i].ip) {
                                    deleteIP.setCustomId(`confirmDel${getIPJSON[i].ip}`);
                                    return;
                                } else {
                                    deleteIP.setCustomId(`confirmDel${getIPJSON[0].ip}`);
                                    return;
                                }
                            }
                        }
                        console.log(addIP);
                        const showRowMenu = new ActionRowBuilder().addComponents(selectMenuIP);
                        const btnDefault = new ActionRowBuilder().addComponents(setDefault);
                        const btnAddDelete = new ActionRowBuilder().addComponents(addIP, deleteIP);
                        message.edit({ components: [showRowMenu] });
                    });
                    timerMenu = setTimeout(selectServer, 1000 * parseInt(FiveMEmbedUpdateTime, 10));
                } else {
                    const selectIP = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('selectIP')
                                .setPlaceholder('Chọn thành phố!!')
                                .addOptions(
                                    {
                                        label: 'Thành Phố Mới',
                                        // description: 'Thành ',
                                        value: `${getIPJSON[0].ip}`,
                                    },
                                ),
                        );

                    const btnRefresh = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(':rewind:859631996912402452')
                                .setLabel('Reload')
                                .setCustomId('btnRefresh'),
                        );
                    await liveChannelName1.send({ components: [selectIP] });
                }
            } else {
                console.log('Bạn chưa điền đầy đủ thông tin .env, Có thể: ServerMessageID')
                return
            }
        }
        liveServerStatus();
        selectServer();
        // clearTimeout(timer);
    }
}