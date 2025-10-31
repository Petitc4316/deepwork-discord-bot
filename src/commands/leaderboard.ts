import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import StatsManager from '../managers/StatsManager';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the Deep Work leaderboard')
  .addIntegerOption(option =>
    option
      .setName('limit')
      .setDescription('Number of users to show (default: 10)')
      .setRequired(false)
      .setMinValue(5)
      .setMaxValue(25)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const limit = interaction.options.getInteger('limit') || 10;
  const leaderboard = StatsManager.getLeaderboard(limit);

  if (leaderboard.length === 0) {
    return interaction.reply({
      content: '📊 No Deep Work sessions have been completed yet!',
      ephemeral: true,
    });
  }

  const medals = ['🥇', '🥈', '🥉'];

  const leaderboardText = leaderboard
    .map((entry, index) => {
      const medal = medals[index] || `**${entry.rank}.**`;
      const hours = Math.floor(entry.totalMinutes / 60);
      const mins = entry.totalMinutes % 60;

      return `${medal} **${entry.username}**\n└ ${hours}h ${mins}m • ${entry.totalSessions} sessions`;
    })
    .join('\n\n');

  const embed = new EmbedBuilder()
    .setColor('#ffd700')
    .setTitle('🏆 Deep Work Leaderboard')
    .setDescription(leaderboardText)
    .setFooter({
      text: 'Keep up the focused work! Use /stats to see your personal progress.',
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
