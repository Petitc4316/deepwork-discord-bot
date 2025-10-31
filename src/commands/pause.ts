import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Manually pause the current Deep Work session');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to pause a session!',
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

  // Check if already paused
  if (SessionManager.isPaused(voiceChannel.id)) {
    return interaction.reply({
      content: '⚠️ The session is already paused.',
      ephemeral: true,
    });
  }

  // Attempt to pause
  const success = SessionManager.manualPauseSession(voiceChannel.id, member.id);

  if (!success) {
    return interaction.reply({
      content: '❌ Only the session initiator can manually pause the session!',
      ephemeral: true,
    });
  }

  const elapsed = SessionManager.getElapsedMinutes(voiceChannel.id);
  const remaining = SessionManager.getRemainingMinutes(voiceChannel.id);

  const embed = new EmbedBuilder()
    .setColor('#ffa500')
    .setTitle('⏸️ Session Paused')
    .setDescription(
      `**${member.user.username}** paused the session.\n\n` +
      `Elapsed: **${Math.round(elapsed)} minutes**\n` +
      `Remaining: **${Math.round(remaining)} minutes**\n\n` +
      `Use \`/resume\` to continue.`
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
