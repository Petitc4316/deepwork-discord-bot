import { VoiceState } from 'discord.js';
import SessionManager from '../managers/SessionManager';

export async function execute(oldState: VoiceState, newState: VoiceState) {
  const member = newState.member;
  if (!member || member.user.bot) return;

  // Get the channel they were in or are now in
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  // Check if they left a channel with an active session
  if (oldChannel && !newChannel) {
    const session = SessionManager.getSession(oldChannel.id);
    if (session && SessionManager.isActive(oldChannel.id)) {
      // Someone left - check if all participants are still present
      const participants = Array.from(session.participants.keys());
      const membersInChannel = Array.from(oldChannel.members.keys()).filter(
        id => !oldChannel.members.get(id)?.user.bot
      );

      const allPresent = participants.every(participantId =>
        membersInChannel.includes(participantId)
      );

      if (!allPresent && !SessionManager.isPaused(oldChannel.id)) {
        SessionManager.pauseSession(oldChannel.id);

        // Send pause notification
        const guild = oldChannel.guild;
        const textChannel = guild.channels.cache.find(
          ch => ch.name.includes('general') || ch.name.includes('chat')
        );

        if (textChannel && textChannel.isTextBased()) {
          const embed = SessionManager.getStatusEmbed(oldChannel.id);
          await textChannel.send({
            content: `⏸️ <@${member.id}> left the voice channel. Session paused!`,
            embeds: [embed],
          });
        }
      }
    }
  }

  // Check if they joined a channel with a paused session
  if (newChannel && oldChannel?.id !== newChannel.id) {
    const session = SessionManager.getSession(newChannel.id);
    if (session && SessionManager.isPaused(newChannel.id)) {
      // Someone joined - check if all participants are now present
      const participants = Array.from(session.participants.keys());
      const membersInChannel = Array.from(newChannel.members.keys()).filter(
        id => !newChannel.members.get(id)?.user.bot
      );

      const allPresent = participants.every(participantId =>
        membersInChannel.includes(participantId)
      );

      if (allPresent) {
        SessionManager.resumeSession(newChannel.id);

        // Send resume notification
        const guild = newChannel.guild;
        const textChannel = guild.channels.cache.find(
          ch => ch.name.includes('general') || ch.name.includes('chat')
        );

        if (textChannel && textChannel.isTextBased()) {
          const embed = SessionManager.getStatusEmbed(newChannel.id);
          await textChannel.send({
            content: `▶️ All participants have returned. Session resumed!`,
            embeds: [embed],
          });
        }
      }
    }
  }
}
