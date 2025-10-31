import { VoiceChannel, GuildMember, EmbedBuilder } from 'discord.js';
import StatsManager from './StatsManager';

interface SessionParticipant {
  userId: string;
  username: string;
  confirmed: boolean;
}

interface ActiveSession {
  sessionId: number | null;
  channelId: string;
  guildId: string;
  durationMinutes: number;
  startTime: number | null;
  pausedTime: number | null;
  elapsedMinutes: number;
  participants: Map<string, SessionParticipant>;
  timer: NodeJS.Timeout | null;
  initiatorId: string;
}

export class SessionManager {
  private sessions: Map<string, ActiveSession> = new Map();

  // Start a new session (pending confirmation)
  initiateSession(
    channelId: string,
    guildId: string,
    durationMinutes: number,
    participants: GuildMember[],
    initiatorId: string
  ): ActiveSession {
    const participantMap = new Map<string, SessionParticipant>();

    for (const member of participants) {
      participantMap.set(member.id, {
        userId: member.id,
        username: member.user.username,
        confirmed: member.id === initiatorId, // Initiator auto-confirmed
      });
    }

    const session: ActiveSession = {
      sessionId: null,
      channelId,
      guildId,
      durationMinutes,
      startTime: null,
      pausedTime: null,
      elapsedMinutes: 0,
      participants: participantMap,
      timer: null,
      initiatorId,
    };

    this.sessions.set(channelId, session);
    return session;
  }

  // Get session for a channel
  getSession(channelId: string): ActiveSession | undefined {
    return this.sessions.get(channelId);
  }

  // Confirm participation
  confirmParticipant(channelId: string, userId: string): boolean {
    const session = this.sessions.get(channelId);
    if (!session) return false;

    const participant = session.participants.get(userId);
    if (!participant) return false;

    participant.confirmed = true;
    return true;
  }

  // Check if all participants confirmed
  allConfirmed(channelId: string): boolean {
    const session = this.sessions.get(channelId);
    if (!session) return false;

    return Array.from(session.participants.values()).every(p => p.confirmed);
  }

  // Start the session after all confirmations
  startSession(channelId: string): void {
    const session = this.sessions.get(channelId);
    if (!session || session.startTime) return;

    // Create database record
    const participants = Array.from(session.participants.values());
    session.sessionId = StatsManager.createSession(
      channelId,
      session.guildId,
      session.durationMinutes,
      participants
    );

    session.startTime = Date.now();
    session.pausedTime = null;
  }

  // Pause session when someone leaves
  pauseSession(channelId: string): void {
    const session = this.sessions.get(channelId);
    if (!session || !session.startTime || session.pausedTime) return;

    session.pausedTime = Date.now();
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }

    // Calculate elapsed time
    const elapsed = (session.pausedTime - session.startTime) / 1000 / 60;
    session.elapsedMinutes += elapsed;
  }

  // Resume session when everyone returns
  resumeSession(channelId: string): void {
    const session = this.sessions.get(channelId);
    if (!session || !session.pausedTime) return;

    session.startTime = Date.now();
    session.pausedTime = null;
  }

  // Complete session
  completeSession(channelId: string): void {
    const session = this.sessions.get(channelId);
    if (!session) return;

    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }

    // Calculate final elapsed time
    let totalMinutes = session.elapsedMinutes;
    if (session.startTime && !session.pausedTime) {
      const elapsed = (Date.now() - session.startTime) / 1000 / 60;
      totalMinutes += elapsed;
    }

    // Save to database
    if (session.sessionId) {
      StatsManager.completeSession(session.sessionId, Math.round(totalMinutes));
    }

    this.sessions.delete(channelId);
  }

  // Cancel session
  cancelSession(channelId: string): void {
    const session = this.sessions.get(channelId);
    if (!session) return;

    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }

    if (session.sessionId) {
      StatsManager.cancelSession(session.sessionId);
    }

    this.sessions.delete(channelId);
  }

  // Get remaining time in minutes
  getRemainingMinutes(channelId: string): number {
    const session = this.sessions.get(channelId);
    if (!session) return 0;

    let elapsed = session.elapsedMinutes;

    if (session.startTime && !session.pausedTime) {
      const currentElapsed = (Date.now() - session.startTime) / 1000 / 60;
      elapsed += currentElapsed;
    }

    return Math.max(0, session.durationMinutes - elapsed);
  }

  // Check if session is paused
  isPaused(channelId: string): boolean {
    const session = this.sessions.get(channelId);
    return !!(session && session.pausedTime);
  }

  // Check if session is active (started)
  isActive(channelId: string): boolean {
    const session = this.sessions.get(channelId);
    return !!(session && session.startTime);
  }

  // Get session status embed
  getStatusEmbed(channelId: string): EmbedBuilder {
    const session = this.sessions.get(channelId);
    if (!session) {
      return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ No Active Session')
        .setDescription('There is no Deep Work session in this channel.');
    }

    const remaining = this.getRemainingMinutes(channelId);
    const elapsed = session.durationMinutes - remaining;
    const isPaused = this.isPaused(channelId);

    const embed = new EmbedBuilder()
      .setColor(isPaused ? '#ffa500' : '#00ff00')
      .setTitle(isPaused ? '⏸️ Session Paused' : '⏱️ Deep Work Session Active')
      .addFields(
        { name: 'Duration', value: `${session.durationMinutes} minutes`, inline: true },
        { name: 'Elapsed', value: `${Math.round(elapsed)} minutes`, inline: true },
        { name: 'Remaining', value: `${Math.round(remaining)} minutes`, inline: true }
      );

    if (isPaused) {
      embed.setDescription('⚠️ Session paused - waiting for all participants to return to the voice channel');
    }

    // Add participants
    const participantList = Array.from(session.participants.values())
      .map(p => `${p.confirmed ? '✅' : '⏳'} ${p.username}`)
      .join('\n');

    embed.addFields({ name: 'Participants', value: participantList || 'None', inline: false });

    return embed;
  }
}

export default new SessionManager();
