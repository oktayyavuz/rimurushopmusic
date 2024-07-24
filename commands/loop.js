import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Çalmakta olan şarkıyı döngüye alır veya döngüyü kapatır.');

async function execute(interaction, player) {
    try {
        await interaction.deferReply();

        const queue = player.nodes.get(interaction.guild.id);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.followUp({ content: 'Şu anda çalan bir şarkı yok.', ephemeral: true });
        }

        const loopMode = queue.repeatMode;
        const newLoopMode = loopMode === 0 ? 1 : 0;  

        queue.setRepeatMode(newLoopMode);

        return interaction.followUp({ content: `Döngü modu ${newLoopMode === 1 ? 'açıldı' : 'kapandı'}.` });
    } catch (error) {
        console.error(error);

        const embed = new EmbedBuilder()
            .setTitle('Bir şeyler ters gitti')
            .setDescription('Çalma sırasında bir hata oluştu')
            .setColor(0xff0000)
            .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    }
}

export default { data, execute };
