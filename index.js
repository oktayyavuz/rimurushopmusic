import { Client, GatewayIntentBits, Collection, Routes, EmbedBuilder, ChannelType } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Player } from 'discord-player';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import Play from './commands/play.js';
import Skip from './commands/skip.js';
import Pause from './commands/pause.js';
import Resume from './commands/resume.js';
import Stop from './commands/stop.js';
import Lyrics from './commands/lyrics.js';
import Loop from './commands/loop.js';

dotenv.config();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    },
    leaveOnEmpty: false,
    leaveOnEnd: false,
    leaveOnStop: false
});

player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

const commands = [];

client.commands.set(Play.data.name, Play.execute);
client.commands.set(Skip.data.name, Skip.execute);
client.commands.set(Pause.data.name, Pause.execute);
client.commands.set(Resume.data.name, Resume.execute);
client.commands.set(Stop.data.name, Stop.execute);
client.commands.set(Lyrics.data.name, Lyrics.execute);
client.commands.set(Loop.data.name, Loop.execute);

commands.push(Play.data.toJSON());
commands.push(Skip.data.toJSON());
commands.push(Pause.data.toJSON());
commands.push(Resume.data.toJSON());
commands.push(Stop.data.toJSON());
commands.push(Lyrics.data.toJSON());
commands.push(Loop.data.toJSON());

const eventsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    import(pathToFileURL(filePath).href).then(event => {
        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else {
            client.on(event.default.name, (...args) => event.default.execute(...args));
        }
    }).catch(error => console.error(`Error loading event file ${file}:`, error));
}


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) return;

    try {
        const func = client.commands.get(interaction.commandName);
        await func(interaction, player);
    } catch (error) {
        const embed = new EmbedBuilder().setTitle('Bir şeyler ters gitti!!')
            .setDescription('Çalma sırasında bir hata oluştu')
            .setTimestamp(new Date());

        return interaction.followUp({ embeds: [embed] });
    }
});


const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Uygulama (/) komutlarını yenilemeye başladım.');

        await rest.put(
            Routes.applicationCommands(config.client_id),
            { body: commands },
        );

        console.log('Başarıyla uygulama (/) komutlarını yeniledim.');
    } catch (error) {
        console.error(error);
    }
})();

client.login(config.token);

process.on('unhandledRejection', (reason) => {
    console.error('Yakalanmamış vaad hatası:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Yakalanmamış istisna:', error.message);
});