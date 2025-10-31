# 🚀 Quick Setup Guide

Follow these steps to get your Deep Work bot running in **under 10 minutes**!

## Step 1: Create Your Discord Bot (5 minutes)

### 1.1 Create Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it "Deep Work Bot" (or whatever you like)
4. Click **"Create"**

### 1.2 Create Bot User
1. Click **"Bot"** in the left sidebar
2. Click **"Add Bot"** → Confirm
3. Click **"Reset Token"** and copy the token (⚠️ save this!)
4. Enable these **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 1.3 Get Application ID
1. Click **"General Information"** in the left sidebar
2. Copy your **"Application ID"** (⚠️ save this!)

### 1.4 Invite Bot to Server
1. Click **"OAuth2"** → **"URL Generator"**
2. Check these **Scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Check these **Bot Permissions**:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Connect
   - ✅ Speak
   - ✅ Use Slash Commands
4. Copy the URL at the bottom
5. Paste URL in browser and invite bot to your server

## Step 2: Get Your Server ID (1 minute)

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **"Developer Mode"**
4. Right-click your server icon
5. Click **"Copy Server ID"** (⚠️ save this!)

## Step 3: Configure the Bot (2 minutes)

### 3.1 Install Dependencies
Open terminal in the `deepwork-discord-bot` folder:

```bash
npm install
```

### 3.2 Create .env File
Create a file named `.env` (no extension) with this content:

```env
DISCORD_TOKEN=paste_your_bot_token_here
APPLICATION_ID=paste_your_application_id_here
GUILD_ID=paste_your_server_id_here
```

Replace the values with what you saved in Steps 1 & 2.

## Step 4: Install FFmpeg (Optional - Auto-installed)

FFmpeg is automatically installed via the `ffmpeg-static` package when you run `npm install`.

**No manual installation required!** The bot will use the bundled FFmpeg binary automatically.

## Step 5: Get Completion Sound (2 minutes)

1. Download a free sound from:
   - https://freesound.org/search/?q=bell
   - https://mixkit.co/free-sound-effects/notification/
2. Save as `completion.mp3` in the `assets/` folder
3. Or skip this - bot works without audio (just logs error)

## Step 6: Deploy & Start (1 minute)

### Deploy Commands to Discord
```bash
npm run deploy
```

You should see: ✅ Successfully reloaded commands

### Start the Bot
```bash
npm run dev
```

You should see:
```
🧠 Deep Work Discord Bot is now online!
📊 Logged in as: YourBotName#1234
```

## Step 7: Test It! (1 minute)

1. Join a voice channel in your Discord server
2. Type `/deepwork duration:25`
3. Click "✅ Confirm"
4. The session should start!

## 🎉 You're Done!

Your bot is now tracking Deep Work sessions!

## Quick Reference

**Start Development:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
npm start
```

**Deploy Commands (after changing commands):**
```bash
npm run deploy
```

## ❓ Troubleshooting

**Bot doesn't show up in server:**
- Re-invite using the OAuth2 URL from Step 1.4
- Make sure you selected the right server

**Commands don't appear:**
- Run `npm run deploy`
- Wait 1-2 minutes for Discord to sync
- Try in a different channel

**Bot offline:**
- Check your `.env` file has the correct token
- Run `npm run dev` to see error messages

**Audio doesn't work:**
- Verify FFmpeg: `ffmpeg -version`
- Check `assets/completion.mp3` exists
- Bot still works without audio

**"Missing Access" errors:**
- Bot needs Connect and Speak permissions
- Re-invite with correct permissions

## 💡 Next Steps

- Customize the completion sound
- Invite friends to test it
- Check out `README.md` for advanced features
- Deploy to a server for 24/7 uptime

---

Need help? Check the main README.md or open an issue!
