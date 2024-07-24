import { ApplicationCommandOptionType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { lyricsExtractor } from "@discord-player/extractor";

const lyricsFinder = lyricsExtractor();

const data = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Sözleri alır')
    .addStringOption(option =>
        option.setName('ad-link')
            .setDescription('Şarkı linki veya adı')
            .setRequired(true)
    );

async function execute(interaction, queue) {
    await interaction.deferReply({ ephemeral: true });

    let query = interaction.options.getString("ad-link", false);

    if (!query && !queue?.currentTrack) {
        return interaction.editReply({
            embeds: [ErrorEmbed("Şarkı sözlerini aramak için bir şarkı adı girin.")],
        });
    }

    if (!query)
        query = `${queue?.currentTrack?.author} - ${queue?.currentTrack?.cleanTitle}`;

    const result = await lyricsFinder.search(query).catch(() => null);

    if (!result || !result.lyrics) {
        return interaction.followUp('Şarkının sözleri bulunamadı');
    }

    const lyrics =
        result.lyrics.length > 4096
            ? `${result.lyrics.slice(0, 4093)}...`
            : result.lyrics;

    const embed = new EmbedBuilder()
        .setTitle(result.title)
        .setURL(result.url)
        .setThumbnail(result.thumbnail)
        .setAuthor({
            name: result.artist.name,
            iconURL: result.artist.image,
            url: result.artist.url,
        })
        .setDescription(lyrics);

    return interaction.editReply({ embeds: [embed] });
}

export default {data,execute};