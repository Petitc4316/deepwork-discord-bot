import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Check the status of the current Deep Work session in your voice channel');

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to check session status!',
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

  // Get status embed from SessionManager
  const statusEmbed = SessionManager.getStatusEmbed(voiceChannel.id);

  await interaction.reply({ embeds: [statusEmbed] });
}
