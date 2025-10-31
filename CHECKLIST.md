# ✅ Setup Checklist

Use this checklist to ensure everything is configured correctly.

## 🎯 Prerequisites

- [ ] Node.js 22.12+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Discord account created
- [ ] Discord server where you have admin rights

## 🤖 Discord Setup

- [ ] Created Discord Application at https://discord.com/developers/applications
- [ ] Created Bot user
- [ ] Enabled required Gateway Intents:
  - [ ] Presence Intent
  - [ ] Server Members Intent
  - [ ] Message Content Intent
- [ ] Copied Bot Token
- [ ] Copied Application ID
- [ ] Generated OAuth2 invite URL
- [ ] Invited bot to server
- [ ] Enabled Developer Mode in Discord
- [ ] Copied Server (Guild) ID

## 📁 Project Setup

- [ ] Navigated to `deepwork-discord-bot/` directory
- [ ] Ran `npm install` (should complete without errors)
- [ ] Created `.env` file
- [ ] Added `DISCORD_TOKEN` to `.env`
- [ ] Added `APPLICATION_ID` to `.env`
- [ ] Added `GUILD_ID` to `.env`

## 🔊 Audio Setup (Optional but Recommended)

- [ ] Installed FFmpeg
- [ ] Verified FFmpeg installation (`ffmpeg -version`)
- [ ] Downloaded completion sound
- [ ] Saved sound as `assets/completion.mp3`

## 🚀 Deployment

- [ ] Ran `npm run build` (should compile without errors)
- [ ] Ran `npm run deploy` (should see "Successfully reloaded X commands")
- [ ] Started bot with `npm run dev`
- [ ] Bot shows as online in Discord server
- [ ] Bot shows green "online" status

## 🧪 Testing

- [ ] Joined a voice channel
- [ ] Slash commands appear when typing `/`
- [ ] `/deepwork` command shows up
- [ ] `/stats` command shows up
- [ ] `/leaderboard` command shows up
- [ ] Started test session with `/deepwork duration:1`
- [ ] Confirmation embed appeared
- [ ] Clicked "✅ Confirm" button
- [ ] Session started successfully
- [ ] Session completed after 1 minute
- [ ] Completion sound played (if audio configured)
- [ ] Stats recorded (checked with `/stats`)

## ✨ Advanced (Optional)

- [ ] Tested pause behavior (left voice channel)
- [ ] Tested resume behavior (rejoined voice channel)
- [ ] Tested multi-participant confirmation
- [ ] Tested leaderboard display
- [ ] Tested weekly stats
- [ ] Customized completion sound
- [ ] Adjusted session duration limits
- [ ] Set up for 24/7 hosting

## 🎓 Verification Commands

Run these to verify your setup:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check FFmpeg installation
ffmpeg -version

# Verify project builds
npm run build

# Check TypeScript compilation
npx tsc --noEmit

# View bot logs
npm run dev
```

## 🐛 Common Issues

**Bot doesn't start:**
- [ ] Checked `.env` file exists and has all three variables
- [ ] Verified bot token is correct (no extra spaces)
- [ ] Checked console for error messages

**Commands don't appear:**
- [ ] Ran `npm run deploy` after creating `.env`
- [ ] Waited 1-2 minutes for Discord to sync
- [ ] Restarted Discord client
- [ ] Verified APPLICATION_ID and GUILD_ID are correct

**Audio doesn't work:**
- [ ] Installed FFmpeg and added to PATH
- [ ] Restarted terminal/command prompt after installing FFmpeg
- [ ] Verified `completion.mp3` exists in `assets/` folder
- [ ] Checked bot has Connect and Speak permissions

**Session doesn't track:**
- [ ] Database file `deepwork.db` was created
- [ ] No errors in console about SQLite
- [ ] Checked bot has necessary permissions in server

## 📝 Notes

Date completed: _______________

Server name: ___________________

Bot username: __________________

Any customizations made:
_________________________________
_________________________________
_________________________________

---

✅ All checked? You're ready to go! Start your first Deep Work session! 🧠
