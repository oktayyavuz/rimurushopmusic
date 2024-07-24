import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

const data = new SlashCommandBuilder().setName('stop')
    .setDescription('Komple dururur');

async function execute(interaction, player) {
    await interaction.deferReply();
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying) {
        const embed = new EmbedBuilder()
            .setTitle('Neyi durdurcam')
            .setDescription('Ne çalıyor da durdurim')
            .setColor('#FF0000') 
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ text: 'Bir şey çalmıyor', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }

    queue.node.stop();

    const embed = new EmbedBuilder()
        .setTitle('Durduruldu')
        .setDescription('Al durdurdum, mutlu ol')
        .setColor('#00FF00') 
        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
        .setFooter({ text: 'Müzik durduruldu', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    return interaction.followUp({ embeds: [embed] });
}

export default { data, execute };
