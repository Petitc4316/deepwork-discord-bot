import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

// Deploy commands
(async () => {
  try {
    console.log(`\n🔄 Started refreshing ${commands.length} application (/) commands.`);

    const applicationId = process.env.APPLICATION_ID;
    const guildId = process.env.GUILD_ID;

    if (!applicationId) {
      throw new Error('APPLICATION_ID not found in environment variables!');
    }

    let data: any;

    if (guildId) {
      // Deploy to specific guild (faster for development)
      console.log(`📍 Deploying to guild: ${guildId}`);
      data = await rest.put(
        Routes.applicationGuildCommands(applicationId, guildId),
        { body: commands }
      );
    } else {
      // Deploy globally (takes up to 1 hour to propagate)
      console.log('🌐 Deploying globally (may take up to 1 hour)');
      data = await rest.put(
        Routes.applicationCommands(applicationId),
        { body: commands }
      );
    }

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    console.log('\n🎉 Commands deployed! Your bot is ready to use.\n');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
