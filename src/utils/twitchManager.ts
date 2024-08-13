import axios from 'axios';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { logger } from './logger';
import { addTwitchStreamer, removeTwitchStreamer, getAllTwitchStreamers, updateTwitchStreamerLastNotified, getTwitchNotifyChannel } from './database';

export class TwitchManager {
  private discordClient: Client;
  private twitchClientId: string;
  private twitchClientSecret: string;
  private twitchAccessToken: string | null = null;
  private refreshTime = 60000; // 5 minutes

  constructor(discordClient: Client, clientId: string, clientSecret: string) {
    this.discordClient = discordClient || null;
    this.twitchClientId = clientId;
    this.twitchClientSecret = clientSecret;
  }

  async addStreamer(guildId: string, username: string, notifyChannelId: string): Promise<void> {
    try {
      logger.info(`Adding Twitch streamer ${username} for guild ${guildId}`);
      await addTwitchStreamer(guildId, username, notifyChannelId);
    } catch (error) {
      logger.error(`Error adding Twitch streamer ${username} for guild ${guildId}:`, error);
      throw error;
    }
  }

  async removeStreamer(guildId: string, username: string): Promise<void> {
    await removeTwitchStreamer(guildId, username);
  }

  private async getTwitchAccessToken(): Promise<void> {
    const params = new URLSearchParams();
    params.append('client_id', this.twitchClientId);
    params.append('client_secret', this.twitchClientSecret);
    params.append('grant_type', 'client_credentials');

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', params);
      this.twitchAccessToken = response.data.access_token;
    } catch (error) {
      logger.error('Error getting Twitch access token:', error);
      throw error;
    }
  }

  private constructLiveEmbed(data: any): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${data.user_name} is live! | streaming ${data.game_name}`)
      .setURL(`https://twitch.tv/${data.user_name.toLowerCase()}`)
      .setImage(data.thumbnail_url.replace("{width}", "1920").replace("{height}", "1080"))
      .setColor("#6441A4")
      .addFields([
        { name: "🎮 Title", value: `${data.title}`, inline: true },
        { name: `👤 Viewers`, value: `${data.viewer_count}`, inline: true },
      ]);
  }

  private constructOfflineEmbed(user: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${user} has stopped streaming | Thank you for watching!`)
      .setColor(0x6441a5);
  }

  async checkLiveStreams(): Promise<void> {
    logger.debug(`Checking live streams`);
    if (!this.twitchAccessToken) await this.getTwitchAccessToken();

    const streamers = await getAllTwitchStreamers();

    logger.debug(`Checking ${streamers.length} streamers`);
    
    for (const streamer of streamers) {
      try {
        const headers = {
          'Client-ID': this.twitchClientId,
          'Authorization': `Bearer ${this.twitchAccessToken}`
        };

        const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamer.username}`, { headers });
        const data = response.data.data[0];

        const guild = await this.discordClient.guilds.fetch(streamer.guildId);
        const channel = await guild.channels.fetch(streamer.notifyChannelId) as TextChannel;

        if (data && data.type === 'live') {
          if (!streamer.lastNotified || new Date(streamer.lastNotified) < new Date(data.started_at)) {
            const embed = this.constructLiveEmbed(data);
            await channel.send({ embeds: [embed] });
            await updateTwitchStreamerLastNotified(streamer.id, new Date());
          }
        } else {
          // Optional: Handle going offline
          if (streamer.lastNotified) {
            const embed = this.constructOfflineEmbed(streamer.username);
            await channel.send({ embeds: [embed] });
            await updateTwitchStreamerLastNotified(streamer.id, null);
          }
        }
      } catch (error) {
        logger.error(`Error checking stream for ${streamer.username}:`, error);
      }
    }

    // Schedule the next check
    // setTimeout(() => this.checkLiveStreams(), this.refreshTime);
  }
}