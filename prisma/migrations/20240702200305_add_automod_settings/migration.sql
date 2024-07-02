-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "welcomeChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoRoles" TEXT[],

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalProfile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currency" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kicks" INTEGER NOT NULL DEFAULT 0,
    "bans" INTEGER NOT NULL DEFAULT 0,
    "warns" INTEGER NOT NULL DEFAULT 0,
    "mutes" INTEGER NOT NULL DEFAULT 0,
    "reputation" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "GlobalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerProfile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionRole" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "ReactionRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoMod" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "logChannelId" TEXT,
    "profanityFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "profanityWordList" TEXT[],
    "spamDetectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxMessagesPerMinute" INTEGER NOT NULL DEFAULT 5,
    "inviteLinkDetectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowedInvites" TEXT[],
    "capsDetectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxCapsPercentage" INTEGER NOT NULL DEFAULT 70,
    "mentionLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxMentionsPerMessage" INTEGER NOT NULL DEFAULT 5,
    "emojiLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxEmojisPerMessage" INTEGER NOT NULL DEFAULT 10,
    "phishingDetectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "punishmentLadder" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "AutoMod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalProfile_userId_key" ON "GlobalProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerProfile_userId_guildId_key" ON "ServerProfile"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionRole_guildId_messageId_roleId_key" ON "ReactionRole"("guildId", "messageId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "AutoMod_guildId_key" ON "AutoMod"("guildId");

-- AddForeignKey
ALTER TABLE "GlobalProfile" ADD CONSTRAINT "GlobalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerProfile" ADD CONSTRAINT "ServerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerProfile" ADD CONSTRAINT "ServerProfile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionRole" ADD CONSTRAINT "ReactionRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoMod" ADD CONSTRAINT "AutoMod_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
