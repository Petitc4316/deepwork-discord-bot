import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import path from 'path';

export async function playCompletionSound(channel: VoiceBasedChannel): Promise<void> {
  try {
    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator as any,
      selfDeaf: false, // Don't deafen the bot so it can be seen as active
      selfMute: false, // Don't mute the bot so it can play sounds
      daveEncryption: false, // Disable DAVE encryption (requires @snazzah/davey package)
    });

    // Wait for connection to be ready
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

    // Create audio player
    const player = createAudioPlayer();

    // Create audio resource from completion sound
    const audioPath = path.join(__dirname, '../../assets/completion.wav');
    const resource = createAudioResource(audioPath);

    // Subscribe the connection to the player
    connection.subscribe(player);

    // Play the sound
    player.play(resource);

    // Wait for the sound to finish
    await new Promise<void>((resolve) => {
      player.on(AudioPlayerStatus.Idle, () => {
        resolve();
      });

      // Timeout after 10 seconds
      setTimeout(() => resolve(), 10_000);
    });

    // Leave the voice channel after a short delay
    setTimeout(() => {
      connection.destroy();
    }, 1000);
  } catch (error) {
    console.error('Error playing completion sound:', error);
  }
}
