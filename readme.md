# DAISY Bot

DAISY is a versatile Discord bot designed to enhance your server experience with a wide range of features. From moderation tools to fun games and utility commands, DAISY has something for everyone!

## Features

- **Utility Commands**: Help, Invite, Stats, Uptime, Dice Roll, Coin Flip
- **Economy System**: Daily rewards, Balance check, Slots game
- **Leveling System**: XP gain and level-up notifications
- **Moderation Tools**: Purge messages, Auto-moderation
- **Admin Commands**: Setup welcome messages, Auto-roles, Reaction roles
- **Fun Interactions**: Giveaways, Polls
- **Twitch Integration**: Notifications for live streams
- **Customizable Logging**: Configurable event logging
- **Image Generation**: Welcome images, Economy-related images

## Getting Started

### Prerequisites

- Node.js (v16.9.0 or higher)
- npm (Node Package Manager)
- A Discord Bot Token
- (Optional) Twitch API credentials for stream notifications

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/whereisdan/daisybot.git
   ```

2. Navigate to the project directory:
   ```
   cd daisybot
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your Discord Bot Token:
   ```
   DISCORD_TOKEN=your_bot_token_here
   ```

5. (Optional) Add Twitch API credentials to the `.env` file if using Twitch features:
   ```
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   ```

### Running the Bot

To start the bot, run:
```
npm start
```

## Command Categories

- Utility
- Economy
- Level
- Moderation
- Admin
- Fun

For a full list of commands, use the `/help` command in Discord.

## Customization

- Modify the `src/config.ts` file to change bot settings.
- Add new commands by creating files in the `src/commands/` directory.
- Customize event handlers in the `src/events/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Discord.JS](https://discord.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [node-canvas](https://github.com/Automattic/node-canvas) for image generation