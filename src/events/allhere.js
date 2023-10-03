require('dotenv').config();
const { FooterText, FooterImage1, FooterImage2, ThumnailImage1, ThumnailImage2, EmbedColour, TestMessageID, FiveMChannelID, FiveMMessageID, ServerMessageID, FiveMServerID1, FiveMServerID2, FiveMEmbedUpdateTime, LocationSaveIP } = process.env
const fs = require('fs');


        const saveIPLocation = (ip) => {
            fs.writeFileSync(`${LocationSaveIP}\\ipserver.json`, ip); //Save IP selected to Folder
        }

        // Đọc và ghi file .env
        const setEnvVariable = (key, value) => {
            // Đọc file .env
            const envFileContent = fs.readFileSync('.env', 'utf8');

            // Tìm và thay thế giá trị cũ
            const regex = new RegExp(`${key}=.*`);
            const updatedEnvFileContent = envFileContent.replace(regex, `${key}=${value}`);

            // Ghi mới vào file .env
            fs.writeFileSync('.env', updatedEnvFileContent, 'utf8');

            // console.log(`Đã set lại giá trị của ${key}`);
        }

        // Start FiveM nhưng chỉ trên máy chạy bot
        const StartFiveM = (getIP) => {
            if (getIP == "evkqpb") {
                const connectIP = `explorer fivem://connect/168.100.15.185`;
                exec(connectIP, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Lỗi chạy lệnh: ${error}`);
                        return;
                    }
                    // console.log(`Kết quả CMD:\n${stdout}`);
                });
            } else {
                const connectIP = `explorer fivem://connect/${getIP}`;
                exec(connectIP, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Lỗi chạy lệnh: ${error}`);
                        return;
                    }
                    // console.log(`Kết quả CMD:\n${stdout}`);
                });
            }
        }

module.exports = {
    saveIPLocation,
    setEnvVariable,
    StartFiveM
}