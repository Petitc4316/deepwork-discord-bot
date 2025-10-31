import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume a manually paused Deep Work session');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to resume a session!',
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

  // Check if session is paused
  if (!SessionManager.isPaused(voiceChannel.id)) {
    return interaction.reply({
      content: '⚠️ The session is not paused.',
      ephemeral: true,
    });
  }

  // Check if it's manually paused (can't resume auto-paused sessions)
  if (!session.manuallyPaused) {
    return interaction.reply({
      content: '❌ This session was auto-paused because someone left the voice channel. It will resume automatically when everyone returns.',
      ephemeral: true,
    });
  }

  // Attempt to resume
  const success = SessionManager.manualResumeSession(voiceChannel.id, member.id);

  if (!success) {
    return interaction.reply({
      content: '❌ Only the session initiator can resume the session!',
      ephemeral: true,
    });
  }

  const remaining = SessionManager.getRemainingMinutes(voiceChannel.id);

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('▶️ Session Resumed')
    .setDescription(
      `**${member.user.username}** resumed the session.\n\n` +
      `Remaining time: **${Math.round(remaining)} minutes**\n\n` +
      `Keep up the focus!`
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
