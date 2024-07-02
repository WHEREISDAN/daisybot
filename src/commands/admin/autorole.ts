import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import prisma from '../../utils/database';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage auto roles for new members')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to be automatically assigned to new members')
        .addRoleOption(option => 
          option.setName('role')
            .setDescription('The role to add as an auto role')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from auto assignment')
        .addRoleOption(option => 
          option.setName('role')
            .setDescription('The role to remove from auto roles')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all auto roles')
    ),
  category: 'Admin',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'add':
        await addAutoRole(interaction);
        break;
      case 'remove':
        await removeAutoRole(interaction);
        break;
      case 'list':
        await listAutoRoles(interaction);
        break;
    }
  },
};

async function addAutoRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) {
    await interaction.reply({ content: 'Please provide a valid role.', ephemeral: true });
    return;
  }

  try {
    const guild = await prisma.guild.upsert({
      where: { id: interaction.guild!.id },
      update: {
        autoRoles: {
          push: role.id
        }
      },
      create: {
        id: interaction.guild!.id,
        name: interaction.guild!.name,
        autoRoles: [role.id]
      }
    });

    await interaction.reply({ content: `Added ${role.name} to auto roles.`, ephemeral: true });
    logger.info(`Auto role added in guild ${interaction.guild!.name}: ${role.name}`);
  } catch (error) {
    logger.error('Error adding auto role:', error);
    await interaction.reply({ content: 'An error occurred while adding the auto role.', ephemeral: true });
  }
}

async function removeAutoRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) {
    await interaction.reply({ content: 'Please provide a valid role.', ephemeral: true });
    return;
  }

  try {
    const guild = await prisma.guild.findUnique({
      where: { id: interaction.guild!.id }
    });

    if (!guild || !guild.autoRoles.includes(role.id)) {
      await interaction.reply({ content: 'This role is not set as an auto role.', ephemeral: true });
      return;
    }

    await prisma.guild.update({
      where: { id: interaction.guild!.id },
      data: {
        autoRoles: {
          set: guild.autoRoles.filter((id: string) => id !== role.id)
        }
      }
    });

    await interaction.reply({ content: `Removed ${role.name} from auto roles.`, ephemeral: true });
    logger.info(`Auto role removed in guild ${interaction.guild!.name}: ${role.name}`);
  } catch (error) {
    logger.error('Error removing auto role:', error);
    await interaction.reply({ content: 'An error occurred while removing the auto role.', ephemeral: true });
  }
}

async function listAutoRoles(interaction: ChatInputCommandInteraction) {
  try {
    const guild = await prisma.guild.findUnique({
      where: { id: interaction.guild!.id }
    });

    if (!guild || guild.autoRoles.length === 0) {
      await interaction.reply({ content: 'There are no auto roles set for this server.', ephemeral: true });
      return;
    }

    const roleNames = guild.autoRoles.map((roleId: string) => {
      const role = interaction.guild!.roles.cache.get(roleId);
      return role ? role.name : 'Unknown Role';
    });

    await interaction.reply({
      content: `Auto roles for this server:\n${roleNames.join('\n')}`,
      ephemeral: true
    });
  } catch (error) {
    logger.error('Error listing auto roles:', error);
    await interaction.reply({ content: 'An error occurred while listing the auto roles.', ephemeral: true });
  }
}