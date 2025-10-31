# 🧠 Deep Work Discord Bot

A Discord bot for tracking Deep Work sessions in voice channels. Perfect for study groups, productivity teams, or anyone who wants to maintain focus with accountability partners.

## ✨ Features

- **📊 Session Tracking**: Start timed Deep Work sessions with friends
- **✅ Confirmation Flow**: All participants must confirm before sessions start
- **⏸️ Auto-Pause**: Sessions automatically pause when someone leaves the voice channel
- **▶️ Auto-Resume**: Sessions resume when everyone returns
- **🎵 Completion Sound**: Plays an alert when the session completes
- **📈 Statistics**: Track your Deep Work hours and completed sessions
- **🏆 Leaderboard**: Compete with friends for most focused time
- **💾 Persistent Storage**: All stats saved to SQLite database

## 🚀 Setup

### Prerequisites

- Node.js 22.12.0 or newer
- A Discord account and server
- Basic command line knowledge

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy your bot token (you'll need this later)
6. Go to "OAuth2" → "General" and copy your Application ID

### 2. Invite Bot to Your Server

1. In the Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Connect (Voice)
   - ✅ Speak (Voice)
   - ✅ Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 3. Get Your Server ID

1. In Discord, go to User Settings → Advanced
2. Enable "Developer Mode"
3. Right-click your server icon and select "Copy Server ID"

### 4. Configure the Bot

1. Navigate to the project directory:
```bash
cd deepwork-discord-bot
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
```env
DISCORD_TOKEN=your_bot_token_here
APPLICATION_ID=your_application_id_here
GUILD_ID=your_guild_id_here
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Install FFmpeg

The bot needs FFmpeg to play audio. Install it based on your OS:

**Windows:**
- Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- Extract and add to your PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 7. Deploy Commands

Register the slash commands with Discord:

```bash
npm run deploy
```

### 8. Start the Bot

**Development mode** (auto-restarts on changes):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

## 🎮 Usage

### Starting a Deep Work Session

1. Join a voice channel with your study partners
2. Use the `/deepwork` command:
   ```
   /deepwork duration:60
   ```
3. All participants must click "✅ Confirm"
4. The session starts when everyone confirms
5. Stay in the voice channel - it pauses if anyone leaves!

### Viewing Statistics

**Your personal stats:**
```
/stats
```

**Someone else's stats:**
```
/stats user:@username
```

### Checking the Leaderboard

```
/leaderboard
```

Show more users:
```
/leaderboard limit:25
```

## 📋 Commands

| Command | Description | Options |
|---------|-------------|---------|
| `/deepwork` | Start a Deep Work session | `duration` (1-240 minutes) |
| `/stats` | View Deep Work statistics | `user` (optional) |
| `/leaderboard` | View the leaderboard | `limit` (5-25, default: 10) |

## 🎯 How It Works

1. **Session Initiation**: When you run `/deepwork`, the bot creates a session and asks all voice channel members to confirm
2. **Confirmation**: Everyone must click the Confirm button (initiator is auto-confirmed)
3. **Active Session**: Once everyone confirms, the timer starts
4. **Pause on Leave**: If anyone leaves the voice channel, the session pauses for everyone
5. **Resume on Return**: When all participants return, the session resumes automatically
6. **Completion**: When time expires, the bot plays a sound and records stats for all participants

## 📁 Project Structure

```
deepwork-discord-bot/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── deepwork.ts
│   │   ├── stats.ts
│   │   └── leaderboard.ts
│   ├── events/            # Discord event handlers
│   │   ├── voiceStateUpdate.ts
│   │   └── interactionCreate.ts
│   ├── managers/          # Business logic
│   │   ├── SessionManager.ts
│   │   └── StatsManager.ts
│   ├── utils/             # Utilities
│   │   ├── database.ts
│   │   └── audio.ts
│   ├── index.ts           # Bot entry point
│   └── deploy-commands.ts # Command deployment script
├── assets/
│   └── completion.mp3     # Completion sound
├── .env                   # Your credentials (not committed)
├── .env.example          # Template for credentials
├── package.json
└── tsconfig.json
```

## 🔧 Customization

### Change Completion Sound

Replace `assets/completion.mp3` with your own audio file (MP3 format recommended).

### Adjust Session Duration Limits

Edit `src/commands/deepwork.ts`:
```typescript
.setMinValue(1)      // Minimum minutes
.setMaxValue(240)    // Maximum minutes
```

### Modify Pause Behavior

Edit `src/events/voiceStateUpdate.ts` to change when sessions pause/resume.

## 🐛 Troubleshooting

**Bot doesn't respond to commands:**
- Make sure you ran `npm run deploy`
- Check that the bot has the "Use Application Commands" permission
- Ensure the bot is online (`npm run dev`)

**Audio doesn't play:**
- Verify FFmpeg is installed: `ffmpeg -version`
- Check that the bot has "Connect" and "Speak" permissions
- Ensure `assets/completion.mp3` exists

**Database errors:**
- Delete `deepwork.db` and restart the bot to recreate tables

**"Missing Access" errors:**
- Re-invite the bot with the correct permissions using the OAuth2 URL generator

## 📊 Database

The bot uses SQLite for data persistence. The database file `deepwork.db` is created automatically.

**Tables:**
- `users` - User statistics
- `sessions` - Deep Work session records
- `session_participants` - Links users to sessions

## 🚀 Deployment

### Running 24/7

For production deployment, consider:

- **Railway**: [railway.app](https://railway.app)
- **Heroku**: [heroku.com](https://heroku.com)
- **DigitalOcean**: VPS hosting
- **PM2**: Process manager for Node.js

### Using PM2 (Linux/Mac)

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name deepwork-bot
pm2 save
pm2 startup
```

## 📝 License

MIT

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 💡 Ideas for Enhancement

- [ ] Break reminders (Pomodoro technique)
- [ ] Custom session categories (coding, reading, writing)
- [ ] Streak tracking and achievements
- [ ] Integration with productivity apps
- [ ] Multi-server leaderboards
- [ ] Session scheduling

---

Built with ❤️ for focused work and productivity
