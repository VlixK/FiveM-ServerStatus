module.exports = {
    name: 'ready',
    once: true,
    async execute(client)
    {
        console.log(`${client.user.tag} chạy lại!`);
    }
}