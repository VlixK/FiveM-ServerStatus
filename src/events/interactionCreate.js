require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ActivityType, TextInputStyle, ButtonStyle, Attachment, AttachmentBuilder } = require('discord.js');
const cfx = require('cfx-api');
const { defaultIP, filePath, FooterText, FooterImage1, FooterImage2, ThumnailImage1, ThumnailImage2, EmbedColour, TestMessageID, FiveMChannelID, FiveMMessageID, ServerMessageID, FiveMServerID1, FiveMServerID2, FiveMEmbedUpdateTime, LocationSaveIP, CustomIP } = process.env
const fs = require('fs');
//const allhere = require('./allhere.js');
const getIPJSON = require(`${LocationSaveIP}\\ipserver.json`); //Get IP from Location
const axios = require('axios');
const { exec } = require('child_process');
const Shell = require('node-powershell');
const { ModalBuilder, TextInputBuilder, StringSelectMenuBuilder } = require('@discordjs/builders');
const { resetTimer } = require('./ServerStatus');
const { setEnvVariable, StartFiveM } = require('./allhere');
let globalIP = defaultIP;
let ipconnect = defaultIP;
let thumnailImage = 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png';
let footerImage = 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png';
let titleName = '```' + `               Thành Phố Mới           ` + '```';
let isRunningButton;
let isRunningStatus;
let timerStt;
let timerMn;
const timestamp = Date.now();
const date = new Date(timestamp);

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        globalIP = `${interaction.values}`;

        // console.log("---------------------------------------------------------------------")


        if (getIPJSON.length > 0) {
            for (let i = 0; i < getIPJSON.length; i++) {
                if (interaction.customId === getIPJSON[i].ip) {
                    globalIP = getIPJSON[i].ip;

                    // console.log(`Button IP: ${globalIP}`);
                }
                if (globalIP === getIPJSON[i].ip) {
                    thumnailImage = getIPJSON[i].image;
                    footerImage = getIPJSON[i].image;
                    titleName = '```' + `               ${getIPJSON[i].svname}           ` + '```';
                    ipconnect = getIPJSON[i].ipconnect;
                }
            }
        }


        const liveServerStatus = async (getip) => {
            //console.log(`Interaction Vừa reset IP: ${getip}`);
            var showPlayerInfo = false
            if (FiveMChannelID !== '') {
                const liveChannelName = interaction.channel.messages.fetch(FiveMMessageID);
                if (FiveMMessageID !== '') {
                    await axios.get(`https://servers-frontend.fivem.net/api/servers/single/${getip}`, {
                        headers: { "User-Agent": "cfx" },
                    })
                        .then(async (response) => {
                            // console.log('work')
                            var liveStatus = await cfx.fetchStatus();
                            var liveServer = await cfx.fetchServer(getip);
                            if (liveServer !== undefined) {
                                liveChannelName.then((message) => {
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
                                        .setFooter({ text: '• Lần cập nhật cuối: ', iconURL: footerImage })
                                        .setTimestamp()

                                        if (getIPJSON.length > 0) {
                                            for (let i = 0; i < getIPJSON.length; i++) {
                                                if (getip === getIPJSON[i].ip) {
                                                    if (getIPJSON[i].ipconnect){
                                                        liveStatusMessage.addFields ({ name: '> IP CONNECT', value: "```" + `connect ${getIPJSON[i].ipconnect}` + "```", inline: true })
                                                    }else {
                                                        liveStatusMessage.addFields ({ name: '> IP CONNECT', value: "```" + `connect ${getip}` + "```", inline: true })
                                                    }
                                                }
                                            }
                                        }
                                    if (showPlayerInfo === true) {
                                        const livePlayerNames = []
                                        if (liveServer.players[0].name.includes('Anon')) {
                                            liveStatusMessage.addFields({ name: '🌏 Dân cư', value: 'Thành Phố Ẩn' },)
                                        } else {
                                            for (var player in liveServer.players) {
                                                livePlayerNames.push(`ID: ${liveServer.players[player].id} | ${liveServer.players[player].name}\n`)
                                            }

                                            for (let i = 0; i < livePlayerNames.length; i += 20) {
                                                liveStatusMessage.addFields({ name: `Bạn thứ ${i + 1}-${i + 20}`, value: `${livePlayerNames.sort().slice(i, i + 20).join('')}`, inline: true },)
                                            }
                                        }
                                    }

                                    const buttons = [];
                                    if (getIPJSON.length > 0) {
                                        for (let i = 0; i < getIPJSON.length; i++) {
                                            if (getip === getIPJSON[i].ip) {
                                                const buttonShowPlayers = new ButtonBuilder()
                                                    .setStyle('Primary')
                                                    .setEmoji('🌏')
                                                    .setLabel(`Cư Dân ${getIPJSON[i].svname}`)
                                                    .setCustomId(`${getIPJSON[i].ip}`)
                                                buttons.push(buttonShowPlayers);
                                            }
                                            // if (getip === getIPJSON[i].ip) {
                                            //     const buttonPlay = new ButtonBuilder()
                                            //         .setStyle('Primary')
                                            //         .setEmoji(':popcornsnail:841325345776074753')
                                            //         .setLabel(`Vào ${getIPJSON[i].svname}`)
                                            //         .setCustomId(`play${getIPJSON[i].ip}`)
                                            //     buttons.push(buttonPlay);
                                            // }
                                        }
                                    }
                                    const btnShow = new ActionRowBuilder().addComponents(buttons);
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
                                const customStatus = [`[${liveServer.playersCount}/${liveServer.maxPlayers}]`]
                                interaction.message.author?.setActivity(`${customStatus[Math.floor(Math.random() * customStatus.length)]}`, { type: 3 });

                                // interaction.message.author?.setPresence({
                                //     activities: [{ name: customStatus[Math.floor(Math.random() * customStatus.length)], type: 3 }],
                                //     status: 'online',
                                //   });
                                // }
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
                            liveChannelName.then((message) => {

                                const liveStatusMessage = new EmbedBuilder()
                                    .setTitle(titleName)
                                    .setThumbnail(thumnailImage)
                                    .setColor(EmbedColour)
                                    .addFields(
                                        { name: '> **Đèn Thành Phố**', value: '```🔴 Tắt đèn```', inline: true },
                                        { name: '> Nguồn Điện', value: "```⚠️ Sụp Nguồn```", inline: true },
                                        { name: '> Cư dân', value: "```" + `🌏 0 / 0` + "```", inline: true },
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
                            interaction.message.author?.setActivity(`We Don't Hợp Nhao`, { type: ActivityType.Playing });
                        })

                    const resetStatus = () => {
                        liveServerStatus(getip);
                    }
                    timerStt = setTimeout(resetStatus, 1000 * parseInt(FiveMEmbedUpdateTime, 10))
                }
            }
            else {
                console.log('Bạn chưa điền đầy đủ thông tin .env, Có thể: FiveMChannelID')
                return
            }
        }

        const showPlayers = async (showIP) => {

            // console.log(`${interaction.user.tag} ở #${interaction.channel.name} xem IP ${titleName} lúc ${date.toLocaleString()}.`);

            var showPlayerInfo = true
            if (FiveMChannelID !== '') {
                await axios.get(`https://servers-frontend.fivem.net/api/servers/single/${showIP}`, {
                    headers: { "User-Agent": "cfx" },
                })
                    .then(async (response) => {
                        var liveServer = await cfx.fetchServer(showIP)
                        if (liveServer !== undefined) {

                            const liveStatusMessage = new EmbedBuilder()
                                .setColor(EmbedColour)
                                // .addFields(
                                //     { name: '𓀗 Nhập vai', value: `👇`, inline: false },
                                // )
                                .setFooter({ text: 'Sẽ biến mất trong vòng 1 phút' })

                            if (showPlayerInfo === true) {
                                const livePlayerNames = []
                                if (liveServer.playersCount > 0) {
                                    if (liveServer.players[0].name !== null) {
                                        if (liveServer.players[0].name.includes('Anon')) {
                                            liveStatusMessage.addFields({ name: '🌏 Dân cư', value: 'Thành Phố Ẩn' },)
                                        } else {
                                            liveStatusMessage.addFields({ name: '🌏 Dân cư', value: ' ' },)
                                            for (var player in liveServer.players) {
                                                livePlayerNames.push(`ID: ${liveServer.players[player].id} | ${liveServer.players[player].name}\n`)
                                            }

                                            for (let i = 0; i < livePlayerNames.length; i += 20) {
                                                liveStatusMessage.addFields({ name: `Bạn thứ ${i + 1}-${i + 20}`, value: `${livePlayerNames.sort().slice(i, i + 20).join('')}`, inline: true },)
                                            }
                                        }
                                    }
                                } else {
                                    liveStatusMessage.addFields({ name: '🌏 Dân cư', value: 'Nguồn Điện Đang Chạy' },)
                                }

                                try {
                                    const message = await interaction.reply({ embeds: [liveStatusMessage], ephemeral: true });
                                    setTimeout(() => {
                                        message.delete();
                                    }, 60000);
                                } catch (error) {
                                    console.log(error);
                                }
                            }
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
                    })
            }
        }

        const selectServer = () => {
            globalIP = defaultIP;

            if (FiveMChannelID !== '') {
                if (ServerMessageID !== '') {
                    const liveSelectServer = interaction.channel.messages.fetch(ServerMessageID);
                    if (liveSelectServer !== '') {
                        liveSelectServer.then((message) => {
                            const selectMenuIP = new StringSelectMenuBuilder()
                                .setCustomId('selectIP')
                                .setPlaceholder('Chọn thành phố!!');

                            if (getIPJSON.length > 0) {
                                for (let i = 0; i < getIPJSON.length; i++) {
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
                                    if (globalIP === getIPJSON[i].ip) {
                                        setDefault.setCustomId(`default${getIPJSON[i].ip}`);
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
                                    if (globalIP === getIPJSON[i].ip) {
                                        deleteIP.setCustomId(`confirmDel${getIPJSON[i].ip}`);
                                    }
                                }
                            }

                            const btnRefresh =  new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji(':rewind:859631996912402452')
                                        .setLabel('Reload Menu')
                                        .setCustomId('btnRefresh')

                            const helpBtnBuilder = new ButtonBuilder()
                                .setLabel('Help')
                                .setEmoji('❔')
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId('btnHelp');

                            const btnAddition = new ActionRowBuilder().addComponents(btnRefresh, helpBtnBuilder);
                            const showRowMenu = new ActionRowBuilder().addComponents(selectMenuIP);
                            const btnDefault = new ActionRowBuilder().addComponents(setDefault);
                            const btnAddDelete = new ActionRowBuilder().addComponents(addIP, deleteIP);
                            message.edit({ components: [showRowMenu] });
                        })
                        timerMn = setTimeout(selectServer, 1000 * parseInt(FiveMEmbedUpdateTime, 10));
                    }
                }
            }
        }

        if (interaction.isButton()) {
            // Play FiveM nhưng không work trên client
            if (interaction.customId.includes('play')) {
                // console.log(`${interaction.user.tag} ở #${interaction.channel.name} ấn PLAY`);
                const ip = interaction.customId;
                const play = 'play';

                const startIndex = ip.indexOf(play);
                const endIndex = startIndex + play.length;
                const trimmed = ip.slice(0, startIndex) + ip.slice(endIndex);
                StartFiveM(trimmed.trim());
                interaction.deferUpdate();

                // Set default thành phố (move to front)
            } else if (interaction.customId.includes('default')) {
                // console.log(`${interaction.user.tag} ở #${interaction.channel.name} ấn DEFAULT Server`);
                // Cắt lây ip
                const ip = interaction.customId;
                const defau = 'default';
                const startIndex = ip.indexOf(defau);
                const endIndex = startIndex + defau.length;
                const trimmed = ip.slice(0, startIndex) + ip.slice(endIndex);
                const finalIP = trimmed.trim();

                // Lấy array trong file để đổi
                const getFile = [];
                for (let i = 0; i < getIPJSON.length; i++) {
                    let getArray = [];
                    getArray = {
                        svname: getIPJSON[i].svname,
                        ip: getIPJSON[i].ip,
                        image: getIPJSON[i].image,
                        btnName: getIPJSON[i].btnName
                    }
                    getFile.push(getArray);
                }
                const ipIndex = getFile.findIndex(x => x.ip === finalIP);
                getFile.push(...getFile.splice(0, ipIndex));
                console.log(`Đổi ip ${finalIP} lên đầu`);
                // let sData = JSON.stringify(getFile);
                // fs.writeFileSync(`${LocationSaveIP}\\ipserver.json`, sData); // save to file

                //Load lại status
                clearTimeout(timerStt);
                setEnvVariable('defaultIP', finalIP);
                globalIP = defaultIP;
                liveServerStatus(globalIP);
                try {
                    const message = await interaction.reply({ content: '> Đã Set Thành Phố Mặc Định!! \n> (Ấn Dismiss/Bỏ qua hoặc 10s sau sẽ biến mất)', ephemeral: true });
                    setTimeout(() => {
                        message.delete();
                    }, 5000);
                } catch (error) {
                    console.log(error);
                }

            } else if (interaction.customId === 'btnAdd') {
                // console.log(`${interaction.user.tag} ở #${interaction.channel.name} ấn ADD`);
                globalIP = defaultIP;
                // console.log('add');
                const addmodal = new ModalBuilder()
                    .setCustomId('addmodal')
                    .setTitle('Thêm Thành Phố');

                const serverName = new TextInputBuilder()
                    .setCustomId('svnameInput')
                    .setLabel('Tên Thành Phố')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Thành Phố ABC')
                    .setMinLength(2)

                const ipInput = new TextInputBuilder()
                    .setCustomId('ipInput')
                    .setLabel('Code Của Thành Phố')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(6)
                    .setMaxLength(6)
                    .setPlaceholder('evkqpb')

                const imageInput = new TextInputBuilder()
                    .setCustomId('imageInput')
                    .setLabel('Ảnh TP (https://abc.com/image.png)')
                    .setValue('https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f40c.png')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setMinLength(2)
                // interaction.deferUpdate();

                const firstRow = new ActionRowBuilder().addComponents(serverName);
                const secondRow = new ActionRowBuilder().addComponents(ipInput);
                const thirdRow = new ActionRowBuilder().addComponents(imageInput);

                addmodal.addComponents(firstRow, secondRow, thirdRow);
                await interaction.showModal(addmodal);

            } else if (interaction.customId.includes('delete')) {
                // console.log(`${interaction.user.tag} ở #${interaction.channel.name} ấn DELETE`);

                // Cắt lấy IP
                const ip = interaction.customId;
                const defau = 'delete';
                const startIndex = ip.indexOf(defau);
                const endIndex = startIndex + defau.length;
                const trimmed = ip.slice(0, startIndex) + ip.slice(endIndex);
                const finalIP = trimmed.trim();

                // Tìm và xóa trong array
                const a = getIPJSON.filter(x => x.ip !== finalIP);
                let sData = JSON.stringify(a);
                fs.writeFileSync(`${LocationSaveIP}\\ipserver.json`, sData); // save lại vào file
                console.log(`Delete IP: ${finalIP}`);

                // Load lại status
                clearTimeout(timerStt);
                selectServer();
                globalIP = getIPJSON[0].ip;
                setEnvVariable('defaultIP', globalIP);
                liveServerStatus(globalIP);
                try {
                    const message = await interaction.reply({ content: '> Đã Xóa Thành Phố \n> (Ấn Dismiss/Bỏ qua hoặc 5s sau sẽ biến mất)', ephemeral: true });
                    setTimeout(() => {
                        message.delete();
                    }, 5000);
                } catch (error) {
                    console.log(error);
                }
            } else if (interaction.customId.includes('confirmDel')) {
                globalIP = defaultIP;
                // Cắt lấy IP
                const ip = interaction.customId;
                const defau = 'confirmDel';
                const startIndex = ip.indexOf(defau);
                const endIndex = startIndex + defau.length;
                const trimmed = ip.slice(0, startIndex) + ip.slice(endIndex);
                const finalIP = trimmed.trim();

                // Tạo nút Yes/No
                const confirmNo = new ButtonBuilder()
                    .setLabel('Không Xóa')
                    .setEmoji(':hmmCoffee:750285983744000042')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('confirmNo')

                const confirmYes = new ButtonBuilder()
                    // .setLabel('Xóa Thành Phố Đang Chọn')
                    .setEmoji('✖️')
                    .setStyle(ButtonStyle.Danger)

                for (let i = 0; i < getIPJSON.length; i++) {
                    if (finalIP === getIPJSON[i].ip) {
                        confirmYes.setLabel(`Xóa ${getIPJSON[i].svname}`)
                        confirmYes.setCustomId(`delete${getIPJSON[i].ip}`)
                    }
                }
                const confirm = new ActionRowBuilder().addComponents(confirmYes);

                const message = await interaction.reply({ content: '> Bạn chắc muốn xóa thành phố này không? \n> (Ấn Dismiss/Bỏ qua hoặc 5s sau sẽ biến mất)', components: [confirm], ephemeral: true })
                try {
                    setTimeout(() => {
                        message.delete();
                    }, 5000);
                } catch (error) {
                    console.error(error);
                }

            } else if (interaction.customId === 'confirmNo') {

            } else if (interaction.customId === 'btnHelp') {
                const image1 = new AttachmentBuilder('././img/1.png', 'img1.png');
                const image2 = new AttachmentBuilder('././img/2.png', 'img2.png');
                await interaction.reply({ content: 'Vào https://servers.fivem.net/ search vietnam và chọn server mình muốn', files: [image1, image2], ephemeral: true });
            } else if (interaction.customId === 'btnRefresh') {
                selectServer();
                globalIP = defaultIP;
                interaction.deferUpdate();
            } else {
                clearTimeout(timerStt);
                showPlayers(interaction.customId);
                liveServerStatus(interaction.customId);
            }

        }

        if (interaction.isStringSelectMenu()) {

            // Get IP to set Message at Button
            const selectIPtochange = interaction.channel.messages.fetch(ServerMessageID);
            selectIPtochange.then((message) => {
                if (getIPJSON.length > 0) {
                    for (let i = 0; i < getIPJSON.length; i++) {
                        if (globalIP === getIPJSON[i].ip) {
                            //console.log(`Vừa đổi text sang thành phố ${getIPJSON[i].svname}`);
                            message.edit({ content: `` })
                        }
                    }
                }
            });

            setEnvVariable('defaultIP', globalIP);
            // console.log(`Selected IP: ${globalIP}`);
            clearTimeout(timerStt);
            resetTimer();
            liveServerStatus(globalIP);
            selectServer();
            interaction.deferUpdate();
        }

        if (interaction.isModalSubmit()) {
            //Lấy dữ liệu trong modal
            const getName = interaction.fields.getTextInputValue('svnameInput');
            const getIP = interaction.fields.getTextInputValue('ipInput');
            const getImage = interaction.fields.getTextInputValue('imageInput');

            const save = {
                svname: getName,
                ip: getIP,
                image: getImage,
                btnName: 'Dân cư ' + getName
            }
            // Lấy array trong file để thêm
            const getFile = [];
            for (let i = 0; i < getIPJSON.length; i++) {
                let getArray = [];
                getArray = {
                    svname: getIPJSON[i].svname,
                    ip: getIPJSON[i].ip,
                    image: getIPJSON[i].image,
                    btnName: getIPJSON[i].btnName
                }
                getFile.push(getArray);
            }
            getFile.push(save);
            let sData = JSON.stringify(getFile);
            fs.writeFileSync(`${LocationSaveIP}\\ipserver.json`, sData); // save to file
            globalIP = defaultIP;
            console.log(`Thêm ${getName}`)
            try {
                const message = await interaction.reply({ content: '> Thêm thành phố thành công! \n> (Ấn Dismiss/Bỏ qua hoặc 10s sau sẽ biến mất)', ephemeral: true });
                setTimeout(() => {
                    message.delete();
                }, 10000);
            } catch (error) {
                console.log(error);
            }
        }

        // resetTimer();
    }
}