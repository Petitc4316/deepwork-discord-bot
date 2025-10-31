import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Set FFmpeg path for Windows (if not in PATH)
if (process.platform === 'win32' && !process.env.FFMPEG_PATH) {
  process.env.FFMPEG_PATH = 'C:\\ffmpeg\\bin\\ffmpeg.exe';
}

// Extend the Client type to include commands
declare module 'discord.js' {
  export interface Client {
    commands?: Collection<string, any>;
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️ The command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  const eventName = file.split('.')[0];

  if ('execute' in event) {
    client.on(eventName, (...args) => event.execute(...args));
    console.log(`✅ Loaded event: ${eventName}`);
  } else {
    console.log(`⚠️ The event at ${filePath} is missing required "execute" property.`);
  }
}

// Ready event
client.once('ready', () => {
  console.log('');
  console.log('🤖 =======================================');
  console.log('🧠 Deep Work Discord Bot is now online!');
  console.log(`📊 Logged in as: ${client.user?.tag}`);
  console.log(`🌐 Serving ${client.guilds.cache.size} guild(s)`);
  console.log('🤖 =======================================');
  console.log('');
});

// Login
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN not found in environment variables!');
  console.error('Please create a .env file with your bot token.');
  process.exit(1);
}

client.login(token);
