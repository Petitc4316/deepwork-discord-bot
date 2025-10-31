import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';
import { playCompletionSound } from '../utils/audio';

export const data = new SlashCommandBuilder()
  .setName('end')
  .setDescription('End the current Deep Work session early');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to end a session!',
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
      content: '❌ The session has not started yet. Use the Cancel button instead.',
      ephemeral: true,
    });
  }

  // Check permissions
  const canEnd = SessionManager.endSessionEarly(voiceChannel.id, member.id);
  if (!canEnd) {
    return interaction.reply({
      content: '❌ Only session participants can end the session early!',
      ephemeral: true,
    });
  }

  // Get elapsed time before completing
  const elapsed = SessionManager.getElapsedMinutes(voiceChannel.id);
  const participants = Array.from(session.participants.values());

  // Complete the session
  SessionManager.completeSession(voiceChannel.id);

  // Play completion sound
  if (voiceChannel.isVoiceBased()) {
    await playCompletionSound(voiceChannel);
  }

  // Format time
  const hours = Math.floor(elapsed / 60);
  const mins = Math.round(elapsed % 60);
  const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🎉 Deep Work Session Ended')
    .setDescription(
      `**${member.user.username}** ended the session early.\n\n` +
      `Time worked: **${timeString}**\n\n` +
      `Great job staying focused! Use \`/stats\` to view your progress.`
    )
    .addFields({
      name: 'Participants',
      value: participants.map(p => `✅ ${p.username}`).join('\n'),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
