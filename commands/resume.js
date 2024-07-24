import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue, useTimeline } from 'discord-player';

const data = new SlashCommandBuilder().setName('resume')
    .setDescription('şarkıyı devam ettirir');

async function execute(interaction, player) {
    await interaction.deferReply();
    const timeline = useTimeline(interaction.guildId);

    if (!timeline?.track) {
        const embed = new EmbedBuilder()
            .setTitle('Çalan şarkı yok')
            .setDescription('Hiçbir şey çalmıyom aw')
            .setColor('#FF0000') 
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ text: 'Çalan şarkı bulunamadı', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }

    if (!timeline.paused) {
        const embed = new EmbedBuilder()
            .setTitle('Hata')
            .setDescription('Zaten devam ediyor olm')
            .setColor('#FFA500')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ text: 'Müzik zaten çalıyor', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }

    timeline.resume();

    const embed = new EmbedBuilder()
        .setTitle('Devamsss')
        .setDescription('Devam ediyor..')
        .setColor('#00FF00') 
        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
        .setFooter({ text: 'Müzik devam ediyor', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    return interaction.followUp({ embeds: [embed] });
}

export default { data, execute };
