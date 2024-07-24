import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} Aktif! 💕`);
        client.user.setPresence({
            activities: [{ name: `Reona-ANIMA`, type: ActivityType.Listening }],
            status: 'idle',
        });
    },
};
