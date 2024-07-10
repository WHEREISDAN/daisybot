-- CreateTable
CREATE TABLE "TwitchStreamer" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "notifyChannelId" TEXT NOT NULL,
    "lastNotified" TIMESTAMP(3),

    CONSTRAINT "TwitchStreamer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitchStreamer_username_guildId_key" ON "TwitchStreamer"("username", "guildId");

-- AddForeignKey
ALTER TABLE "TwitchStreamer" ADD CONSTRAINT "TwitchStreamer_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
