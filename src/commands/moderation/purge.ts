import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Collection, Message, TextChannel, User, Embed } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in a channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (max 100)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
    )
    .addStringOption(option =>
      option.setName('match')
        .setDescription('Only delete messages containing this text')
    )
    .addStringOption(option =>
      option.setName('nomatch')
        .setDescription('Do not delete messages containing this text')
    )
    .addBooleanOption(option =>
      option.setName('include_embeds')
        .setDescription('Include embed content in text matching')
    )
    .addStringOption(option =>
      option.setName('startswith')
        .setDescription('Only delete messages starting with this text')
    )
    .addStringOption(option =>
      option.setName('endswith')
        .setDescription('Only delete messages ending with this text')
    )
    .addBooleanOption(option =>
      option.setName('attachments')
        .setDescription('Only delete messages with attachments')
    )
    .addBooleanOption(option =>
      option.setName('bot')
        .setDescription('Only delete messages from bots')
    )
    .addBooleanOption(option =>
      option.setName('inverse')
        .setDescription('Invert the filter conditions')
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the purge')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      await interaction.reply({ content: 'This command can only be used in server text channels.', ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    const amount = interaction.options.getInteger('amount', true);
    const args = {
      user: interaction.options.getUser('user'),
      match: interaction.options.getString('match'),
      nomatch: interaction.options.getString('nomatch'),
      includeEmbeds: interaction.options.getBoolean('include_embeds'),
      startsWith: interaction.options.getString('startswith'),
      endsWith: interaction.options.getString('endswith'),
      attachments: interaction.options.getBoolean('attachments'),
      bot: interaction.options.getBoolean('bot'),
      inverse: interaction.options.getBoolean('inverse'),
      reason: interaction.options.getString('reason'),
    };

    await interaction.deferReply({ ephemeral: true });

    const filter = (message: Message) => {
      let content = message.content.toLowerCase();
      if (args.includeEmbeds && message.embeds.length && !args.inverse)
        content += message.embeds
          .map((embed) => this.getEmbedContent(embed).toLowerCase())
          .join("");
      let completed: boolean[] = [];
      if (args.user)
        completed.push(args.inverse ? args.user.id != message.author.id : args.user.id == message.author.id);
      if (args.match)
        completed.push(args.inverse ? !content.includes(args.match.toLowerCase()) : content.includes(args.match.toLowerCase()));
      if (args.nomatch)
        completed.push(args.inverse ? content.includes(args.nomatch.toLowerCase()) : !content.includes(args.nomatch.toLowerCase()));
      if (args.startsWith)
        completed.push(args.inverse ? !content.startsWith(args.startsWith.toLowerCase()) : content.startsWith(args.startsWith.toLowerCase()));
      if (args.endsWith)
        completed.push(args.inverse ? !content.endsWith(args.endsWith.toLowerCase()) : content.endsWith(args.endsWith.toLowerCase()));
      if (args.attachments)
        completed.push(args.inverse ? !message.attachments.size : message.attachments.size >= 1);
      if (args.bot)
        completed.push(args.inverse ? !message.author.bot : message.author.bot);
      return completed.filter((c) => !c).length == 0;
    };

    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const filteredMessages = messages.filter(filter);

      if (!filteredMessages.size) {
        await interaction.editReply('No messages found matching the criteria.');
        return;
      }

      const deleted = await channel.bulkDelete(filteredMessages, true);
      
      const response = `Successfully deleted ${deleted.size} message(s).`;
      await interaction.editReply(response);

      // You might want to implement logging here
      // this.client.emit("purge", interaction, args.reason, deletedMessages);

      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    } catch (error) {
      console.error('Error in purge command:', error);
      await interaction.editReply('An error occurred while trying to delete messages. Some messages may be too old to delete.');
    }
  },

  getEmbedContent(embed: Embed) {
    let content = [embed.title, embed.description];
    embed.fields.forEach((field: any) =>
      content.push(`${field.name} ${field.value}`)
    );
    if (embed.footer?.text) content.push(embed.footer.text);
    if (embed.author?.name) content.push(embed.author.name);
    return content.join("");
  }
};