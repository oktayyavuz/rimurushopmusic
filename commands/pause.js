import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue, useTimeline } from 'discord-player';

const data = new SlashCommandBuilder().setName('pause')
    .setDescription('Çalan şarkıyı dururur');

async function execute(interaction, player) {
    await interaction.deferReply();

    const timeline = useTimeline(interaction.guildId);

    if (!timeline?.track) {
        const embed = new EmbedBuilder().setTitle('Şarkı yok')
            .setDescription('Neyi durdurcam?');

        return interaction.editReply({ embeds: [embed] });
    }

    if (timeline.paused) {
        const embed = new EmbedBuilder().setTitle('Hata')
            .setDescription('Zaten durdurdum')

        return interaction.followUp({ embeds: [embed] });
    }

    timeline.pause();

    const embed = new EmbedBuilder().setTitle('Durduruldu')
        .setDescription('Durdurdum mutlu musun ')

    return interaction.followUp({ embeds: [embed] });
}

export default { data, execute };