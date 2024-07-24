import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

const data = new SlashCommandBuilder().setName('skip')
    .setDescription('Şarkıyı geçer');

async function execute(interaction, player) {
    await interaction.deferReply();

    const queue = useQueue(interaction.guild);

    if (!queue?.isPlaying()) {
        const embed = new EmbedBuilder()
            .setTitle('Neyi geçicem?')
            .setDescription('Çalan bi şey var da benim mi haberim yok')
            .setColor('#FF0000') 
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ text: 'Şarkı bulunamadı', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }

    queue.node.skip();

    const embed = new EmbedBuilder()
        .setTitle('Geçildi!')
        .setDescription('Bi senden geçemedim.')
        .setColor('#00FF00') 
        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
        .setFooter({ text: 'Şarkı atlandı', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    return interaction.followUp({ embeds: [embed] });
}

export default { data, execute };
