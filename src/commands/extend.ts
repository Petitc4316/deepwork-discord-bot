import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';

export const data = new SlashCommandBuilder()
  .setName('extend')
  .setDescription('Extend the current Deep Work session')
  .addIntegerOption(option =>
    option
      .setName('duration')
      .setDescription('Additional minutes to add')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(240)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to extend a session!',
      ephemeral: true,
    });
  }

  const session = SessionManager.getSession(voiceChannel.id);
  if (!session) {
    return interaction.reply({
      content: '❌ There is no active Deep Work session in your voice channel.',
      ephemeral: true,
    });
  }

  // Check if session has started
  if (!SessionManager.isActive(voiceChannel.id)) {
    return interaction.reply({
      content: '❌ The session has not started yet. Wait for all participants to confirm.',
      ephemeral: true,
    });
  }

  // Check permissions
  if (!SessionManager.canControlSession(voiceChannel.id, member.id)) {
    return interaction.reply({
      content: '❌ Only session participants can extend the session!',
      ephemeral: true,
    });
  }

  const additionalMinutes = interaction.options.getInteger('duration', true);
  const success = SessionManager.extendSession(voiceChannel.id, additionalMinutes);

  if (!success) {
    return interaction.reply({
      content: '❌ Failed to extend session. Please try again.',
      ephemeral: true,
    });
  }

  const newDuration = session.durationMinutes;
  const remaining = SessionManager.getRemainingMinutes(voiceChannel.id);

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('⏱️ Session Extended!')
    .setDescription(
      `**${member.user.username}** extended the session by **${additionalMinutes} minutes**.\n\n` +
      `New total duration: **${newDuration} minutes**\n` +
      `Remaining time: **${Math.round(remaining)} minutes**`
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
