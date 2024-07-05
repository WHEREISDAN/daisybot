-- CreateTable
CREATE TABLE "LogConfig" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "warns" BOOLEAN NOT NULL DEFAULT false,
    "messageDelete" BOOLEAN NOT NULL DEFAULT false,
    "messageUpdate" BOOLEAN NOT NULL DEFAULT false,
    "messageBulkDelete" BOOLEAN NOT NULL DEFAULT false,
    "messageReactionAdd" BOOLEAN NOT NULL DEFAULT false,
    "messageReactionRemove" BOOLEAN NOT NULL DEFAULT false,
    "messageReactionRemoveAll" BOOLEAN NOT NULL DEFAULT false,
    "messageReactionRemoveEmoji" BOOLEAN NOT NULL DEFAULT false,
    "channelCreate" BOOLEAN NOT NULL DEFAULT false,
    "channelDelete" BOOLEAN NOT NULL DEFAULT false,
    "channelUpdate" BOOLEAN NOT NULL DEFAULT false,
    "channelPinsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "guildMemberAdd" BOOLEAN NOT NULL DEFAULT false,
    "guildMemberRemove" BOOLEAN NOT NULL DEFAULT false,
    "guildMemberUpdate" BOOLEAN NOT NULL DEFAULT false,
    "guildBanAdd" BOOLEAN NOT NULL DEFAULT false,
    "guildBanRemove" BOOLEAN NOT NULL DEFAULT false,
    "guildRoleCreate" BOOLEAN NOT NULL DEFAULT false,
    "guildRoleDelete" BOOLEAN NOT NULL DEFAULT false,
    "guildRoleUpdate" BOOLEAN NOT NULL DEFAULT false,
    "guildEmojisUpdate" BOOLEAN NOT NULL DEFAULT false,
    "guildInviteCreate" BOOLEAN NOT NULL DEFAULT false,
    "guildInviteDelete" BOOLEAN NOT NULL DEFAULT false,
    "guildWebhooksUpdate" BOOLEAN NOT NULL DEFAULT false,
    "guildUpdate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LogConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogConfig_guildId_key" ON "LogConfig"("guildId");

-- AddForeignKey
ALTER TABLE "LogConfig" ADD CONSTRAINT "LogConfig_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
