import {
  Interaction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import SessionManager from '../managers/SessionManager';
import { playCompletionSound } from '../utils/audio';

export async function execute(interaction: Interaction) {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction);
  }

  // Handle button interactions
  if (interaction.isButton()) {
    await handleButton(interaction);
  }
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = interaction.client.commands?.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const errorMessage = {
      content: 'There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel!',
      ephemeral: true,
    });
  }

  const session = SessionManager.getSession(voiceChannel.id);
  if (!session) {
    return interaction.reply({
      content: '❌ No session found for this channel!',
      ephemeral: true,
    });
  }

  if (interaction.customId === 'deepwork_confirm') {
    // Check if user is a participant
    if (!session.participants.has(member.id)) {
      return interaction.reply({
        content: '❌ You are not a participant in this session!',
        ephemeral: true,
      });
    }

    // Confirm participant
    SessionManager.confirmParticipant(voiceChannel.id, member.id);

    // Check if all confirmed
    if (SessionManager.allConfirmed(voiceChannel.id)) {
      // Start the session
      SessionManager.startSession(voiceChannel.id);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Deep Work Session Started!')
        .setDescription(
          `Focus time begins now! The session will run for **${session.durationMinutes} minutes**.\n\n` +
          `Stay in the voice channel - the session will pause if anyone leaves.`
        )
        .addFields({
          name: 'Participants',
          value: Array.from(session.participants.values())
            .map(p => `✅ ${p.username}`)
            .join('\n'),
        })
        .setTimestamp();

      await interaction.update({
        embeds: [embed],
        components: [],
      });

      // Set timer for completion
      const completionTime = session.durationMinutes * 60 * 1000;
      setTimeout(async () => {
        const currentSession = SessionManager.getSession(voiceChannel.id);
        if (currentSession && SessionManager.isActive(voiceChannel.id)) {
          await completeSession(voiceChannel.id, interaction);
        }
      }, completionTime);
    } else {
      // Update embed with confirmation
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🧠 Deep Work Session Starting')
        .setDescription(
          `**${session.durationMinutes}-minute** Deep Work session\n\n` +
          `Waiting for all participants to confirm...`
        )
        .addFields({
          name: 'Participants',
          value: Array.from(session.participants.values())
            .map(p => `${p.confirmed ? '✅' : '⏳'} ${p.username}`)
            .join('\n'),
        })
        .setFooter({ text: 'Everyone must click Confirm to start' })
        .setTimestamp();

      await interaction.update({ embeds: [embed] });
    }
  } else if (interaction.customId === 'deepwork_cancel') {
    SessionManager.cancelSession(voiceChannel.id);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('❌ Session Cancelled')
      .setDescription(`The Deep Work session was cancelled by ${member.user.username}.`)
      .setTimestamp();

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  }
}

async function completeSession(channelId: string, interaction: ButtonInteraction) {
  const session = SessionManager.getSession(channelId);
  if (!session) return;

  // Complete the session
  SessionManager.completeSession(channelId);

  // Play completion sound
  const voiceChannel = interaction.guild?.channels.cache.get(channelId);
  if (voiceChannel?.isVoiceBased()) {
    await playCompletionSound(voiceChannel);
  }

  // Send completion message
  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🎉 Deep Work Session Complete!')
    .setDescription(
      `Congratulations! You completed **${session.durationMinutes} minutes** of focused work.\n\n` +
      `Use \`/stats\` to view your progress!`
    )
    .addFields({
      name: 'Participants',
      value: Array.from(session.participants.values())
        .map(p => `✅ ${p.username}`)
        .join('\n'),
    })
    .setTimestamp();

  const textChannel = interaction.channel;
  if (textChannel && 'send' in textChannel) {
    await textChannel.send({ embeds: [embed] });
  }
}
