import db from '../utils/database';

interface UserStats {
  userId: string;
  username: string;
  totalMinutes: number;
  totalSessions: number;
}

interface LeaderboardEntry {
  username: string;
  totalMinutes: number;
  totalSessions: number;
  rank: number;
}

export class StatsManager {
  // Ensure user exists in database
  ensureUser(userId: string, username: string): void {
    const stmt = db.prepare(`
      INSERT INTO users (user_id, username)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET username = ?
    `);
    stmt.run(userId, username, username);
  }

  // Create a new session
  createSession(channelId: string, guildId: string, durationMinutes: number, participants: Array<{userId: string, username: string}>): number {
    const stmt = db.prepare(`
      INSERT INTO sessions (channel_id, guild_id, duration_minutes, started_at, status)
      VALUES (?, ?, ?, datetime('now'), 'active')
    `);

    const result = stmt.run(channelId, guildId, durationMinutes);
    const sessionId = Number(result.lastInsertRowid);

    // Add participants
    const participantStmt = db.prepare(`
      INSERT INTO session_participants (session_id, user_id, username)
      VALUES (?, ?, ?)
    `);

    for (const participant of participants) {
      this.ensureUser(participant.userId, participant.username);
      participantStmt.run(sessionId, participant.userId, participant.username);
    }

    return sessionId;
  }

  // Complete a session
  completeSession(sessionId: number, minutesCompleted: number): void {
    const transaction = db.transaction(() => {
      // Update session
      db.prepare(`
        UPDATE sessions
        SET status = 'completed', completed_at = datetime('now')
        WHERE id = ?
      `).run(sessionId);

      // Update participants
      db.prepare(`
        UPDATE session_participants
        SET minutes_completed = ?
        WHERE session_id = ?
      `).run(minutesCompleted, sessionId);

      // Update user totals
      const participants = db.prepare(`
        SELECT user_id FROM session_participants WHERE session_id = ?
      `).all(sessionId) as Array<{user_id: string}>;

      const updateUserStmt = db.prepare(`
        UPDATE users
        SET total_minutes = total_minutes + ?, total_sessions = total_sessions + 1
        WHERE user_id = ?
      `);

      for (const participant of participants) {
        updateUserStmt.run(minutesCompleted, participant.user_id);
      }
    });

    transaction();
  }

  // Cancel a session
  cancelSession(sessionId: number): void {
    db.prepare(`
      UPDATE sessions
      SET status = 'cancelled'
      WHERE id = ?
    `).run(sessionId);
  }

  // Get user stats
  getUserStats(userId: string): UserStats | null {
    const result = db.prepare(`
      SELECT user_id as userId, username, total_minutes as totalMinutes, total_sessions as totalSessions
      FROM users
      WHERE user_id = ?
    `).get(userId) as UserStats | undefined;

    return result || null;
  }

  // Get daily stats for a user
  getDailyStats(userId: string, days: number = 7): Array<{date: string, minutes: number}> {
    const result = db.prepare(`
      SELECT
        DATE(s.completed_at) as date,
        SUM(sp.minutes_completed) as minutes
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE sp.user_id = ?
        AND s.status = 'completed'
        AND s.completed_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(s.completed_at)
      ORDER BY date DESC
    `).all(userId, days) as Array<{date: string, minutes: number}>;

    return result;
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const results = db.prepare(`
      SELECT
        username,
        total_minutes as totalMinutes,
        total_sessions as totalSessions,
        ROW_NUMBER() OVER (ORDER BY total_minutes DESC) as rank
      FROM users
      WHERE total_sessions > 0
      ORDER BY total_minutes DESC
      LIMIT ?
    `).all(limit) as LeaderboardEntry[];

    return results;
  }

  // Get weekly stats for a user
  getWeeklyStats(userId: string): {totalMinutes: number, totalSessions: number} {
    const result = db.prepare(`
      SELECT
        COALESCE(SUM(sp.minutes_completed), 0) as totalMinutes,
        COUNT(DISTINCT s.id) as totalSessions
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE sp.user_id = ?
        AND s.status = 'completed'
        AND s.completed_at >= datetime('now', '-7 days')
    `).get(userId) as {totalMinutes: number, totalSessions: number};

    return result;
  }
}

export default new StatsManager();
