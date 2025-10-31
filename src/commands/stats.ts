import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import StatsManager from '../managers/StatsManager';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('View Deep Work statistics')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('User to view stats for (defaults to you)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const stats = StatsManager.getUserStats(targetUser.id);

  if (!stats) {
    return interaction.reply({
      content: `📊 ${targetUser.username} hasn't completed any Deep Work sessions yet!`,
      ephemeral: true,
    });
  }

  // Get weekly stats
  const weeklyStats = StatsManager.getWeeklyStats(targetUser.id);

  // Get daily breakdown
  const dailyStats = StatsManager.getDailyStats(targetUser.id, 7);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`📊 Deep Work Stats - ${targetUser.username}`)
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      {
        name: '🏆 All-Time Total',
        value: `**${Math.round(stats.totalMinutes / 60)} hours ${stats.totalMinutes % 60} minutes**\n${stats.totalSessions} sessions completed`,
        inline: false,
      },
      {
        name: '📅 This Week',
        value: `**${Math.round(weeklyStats.totalMinutes / 60)} hours ${weeklyStats.totalMinutes % 60} minutes**\n${weeklyStats.totalSessions} sessions`,
        inline: false,
      }
    )
    .setTimestamp();

  // Add daily breakdown if available
  if (dailyStats.length > 0) {
    const dailyBreakdown = dailyStats
      .map(day => {
        const hours = Math.floor(day.minutes / 60);
        const mins = day.minutes % 60;
        return `**${day.date}**: ${hours}h ${mins}m`;
      })
      .join('\n');

    embed.addFields({
      name: '📈 Last 7 Days',
      value: dailyBreakdown,
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed] });
}
