import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';

export const data = new SlashCommandBuilder()
  .setName('deepwork')
  .setDescription('Start a Deep Work session')
  .addIntegerOption(option =>
    option
      .setName('duration')
      .setDescription('Session duration in minutes')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(240)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to start a Deep Work session!',
      ephemeral: true,
    });
  }

  // Check if session already exists
  if (SessionManager.getSession(voiceChannel.id)) {
    return interaction.reply({
      content: '⚠️ A Deep Work session is already active in this channel!',
      ephemeral: true,
    });
  }

  const duration = interaction.options.getInteger('duration', true);

  // Get all members in voice channel (exclude bots)
  const participants = Array.from(voiceChannel.members.values()).filter(
    m => !m.user.bot
  );

  if (participants.length === 0) {
    return interaction.reply({
      content: '❌ No participants found in the voice channel!',
      ephemeral: true,
    });
  }

  // Initiate session (pending confirmation)
  SessionManager.initiateSession(
    voiceChannel.id,
    interaction.guildId!,
    duration,
    participants,
    member.id
  );

  // Create confirmation embed
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🧠 Deep Work Session Starting')
    .setDescription(
      `**${member.user.username}** wants to start a ${duration}-minute Deep Work session!\n\n` +
      `All participants must confirm to begin. The session will pause if anyone leaves the voice channel.`
    )
    .addFields({
      name: 'Participants',
      value: participants.map(p => `⏳ ${p.user.username}`).join('\n'),
    })
    .setFooter({ text: 'Everyone must click Confirm to start' })
    .setTimestamp();

  // Create confirmation buttons
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('deepwork_confirm')
      .setLabel('✅ Confirm')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('deepwork_cancel')
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}
