import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Şarkı çalar')
    .addStringOption(option =>
        option.setName('ad-link')
            .setDescription('Şarkı linki veya adı')
            .setRequired(true)
    );

async function execute(interaction, player) {
    await interaction.deferReply();

    const query = interaction.options.getString("ad-link");
    const channel = interaction.member.voice.channel;

    if (!channel) {
        return interaction.followUp('Bir ses kanalında olmalısınız.');
    }

    if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channel.id !== channel.id) {
        await interaction.guild.members.me.voice.setChannel(channel);
    }

    const result = await player.search(query, {
        requestedBy: interaction.user,
    });

    if (!result || !result.tracks.length) {
        return interaction.followUp('Aramanızla eşleşen şarkı bulunamadı.');
    }

    const tracks = result.tracks.slice(0, 5);

    const embed = new EmbedBuilder()
        .setTitle('Şarkı Seçin')
        .setDescription('Bir şarkı seçmek için butona tıklayın.')
        .setTimestamp(new Date())
        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }));

    tracks.forEach((track, index) => {
        embed.addFields({
            name: `${index + 1}. ${track.title} Sanatçı: ${track.author} Süre: ${track.duration}`,
            value: `ㅤㅤㅤㅤㅤㅤㅤ`
        });
    });

    const buttons = tracks.map((track, index) => {
        return new ButtonBuilder()
            .setCustomId(`play_${index}`)
            .setLabel(`${index + 1}`)
            .setStyle(ButtonStyle.Primary);
    });

    const row = new ActionRowBuilder().addComponents(buttons);

    await interaction.followUp({ embeds: [embed], components: [row] });

    const filter = i => i.customId.startsWith('play_') && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
        const trackIndex = parseInt(i.customId.split('_')[1], 10);
        const track = tracks[trackIndex];

        try {
            const { track: playingTrack } = await player.play(channel, track, {
                nodeOptions: {
                    metadata: interaction,
                }
            });

            const playingEmbed = new EmbedBuilder()
                .setTitle(`${playingTrack.title} çalınıyor!`)
                .setURL(playingTrack.url)
                .setThumbnail(playingTrack.thumbnail)
                .setDescription(`Sanatçı: ${playingTrack.author}\n${playingTrack.description}`)
                .setTimestamp(new Date())
                .setFooter({ text: `Süre: ${playingTrack.duration}` });

            await i.update({ embeds: [playingEmbed], components: [] });
        } catch (error) {
            console.error(error);
            await i.update({ content: 'Bir hata oluştu, lütfen tekrar deneyin.', components: [] });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.editReply({ content: 'Zaman aşımına uğradı.', components: [] });
        }
    });
}

export default { data, execute };