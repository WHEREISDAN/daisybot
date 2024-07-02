import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { join } from 'path';

// Register custom fonts
GlobalFonts.registerFromPath(join(__dirname, '..', 'assets', 'fonts', 'LEMONMILK-Medium.otf'), 'LEMONMILK-Medium');
GlobalFonts.registerFromPath(join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'), 'Roboto');

function drawGeometricOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.globalAlpha = 0.01; // Low opacity for subtlety
    ctx.fillStyle = '#FFFFFF';

    const triangleSize = 30;
    for (let x = 0; x < width; x += triangleSize) {
        for (let y = 0; y < height; y += triangleSize) {
            // Randomly decide whether to draw each triangle
            if (Math.random() > 0.5) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + triangleSize, y);
                ctx.lineTo(x, y + triangleSize);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    ctx.restore();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function drawRoundedSquareAvatar(ctx: CanvasRenderingContext2D, avatarURL: string, x: number, y: number, size: number, borderRadius: number) {
    const avatar = await loadImage(avatarURL);
    ctx.save();
    drawRoundedRect(ctx, x, y, size, size, borderRadius);
    ctx.clip();
    ctx.drawImage(avatar as any, x, y, size, size);
    ctx.restore();
}

export async function generateWelcomeImage(username: string, avatarURL: string): Promise<Buffer> {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1C1E21';  // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add geometric overlay
    drawGeometricOverlay(ctx as any, canvas.width, canvas.height);

    // Pink accent line
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillRect(0, 0, 5, canvas.height);

    // Avatar
    const avatarSize = 180;
    await drawRoundedSquareAvatar(ctx as any, avatarURL, 30, canvas.height / 2 - avatarSize / 2, avatarSize, 20);

    // Welcome text
    ctx.font = '44px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Welcome', avatarSize + 60, 95);

    // Username
    ctx.font = '32px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillText(username, avatarSize + 60, 132);

    // Server name
    ctx.font = '24px "LEMONMILK-Medium"';
    ctx.fillStyle = '#99AAB5';  // Light grey
    ctx.fillText('to Our Awesome Server!', avatarSize + 60, 165);

    return canvas.toBuffer('image/png');
}

export async function generateBalanceImage(username: string, avatarURL: string, balance: number): Promise<Buffer> {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1C1E21';  // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add geometric overlay
    drawGeometricOverlay(ctx as any, canvas.width, canvas.height);

    // Pink accent line
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillRect(0, 0, 5, canvas.height);

    // Avatar
    const avatarSize = 180;
    await drawRoundedSquareAvatar(ctx as any, avatarURL, 30, canvas.height / 2 - avatarSize / 2, avatarSize, 20);

    // Balance text
    ctx.font = '44px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Balance', avatarSize + 60, 95);

    // Username
    ctx.font = '32px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillText(username, avatarSize + 60, 132);

    // Balance amount
    ctx.font = '36px "LEMONMILK-Medium"';
    ctx.fillStyle = '#99AAB5';  // Light grey
    ctx.fillText(`${balance} coins`, avatarSize + 60, 180);

    return canvas.toBuffer('image/png');
}

export async function generateDailyImage(username: string, avatarURL: string, amount: number, newBalance: number): Promise<Buffer> {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1C1E21';  // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add geometric overlay
    drawGeometricOverlay(ctx as any, canvas.width, canvas.height);

    // Pink accent line
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillRect(0, 0, 5, canvas.height);

    // Avatar
    const avatarSize = 180;
    await drawRoundedSquareAvatar(ctx as any, avatarURL, 30, canvas.height / 2 - avatarSize / 2, avatarSize, 20);

    // Daily reward text
    ctx.font = '44px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Daily Reward', avatarSize + 60, 80);

    // Username
    ctx.font = '32px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillText(username, avatarSize + 60, 120);

    // Reward amount
    ctx.font = '28px "LEMONMILK-Medium"';
    ctx.fillStyle = '#99AAB5';  // Light grey
    ctx.fillText(`You received ${amount} coins`, avatarSize + 60, 160);

    // New balance
    ctx.fillText(`New balance: ${newBalance} coins`, avatarSize + 60, 200);

    return canvas.toBuffer('image/png');
}

export async function generateLevelUpImage(username: string, avatarURL: string, newLevel: number, xp: number, xpForNext: number): Promise<Buffer> {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');
  
    // Background
    ctx.fillStyle = '#1C1E21';  // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Add geometric overlay
    drawGeometricOverlay(ctx as any, canvas.width, canvas.height);
  
    // Pink accent line
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillRect(0, 0, 5, canvas.height);
  
    // Avatar
    const avatarSize = 180;
    await drawRoundedSquareAvatar(ctx as any, avatarURL, 30, canvas.height / 2 - avatarSize / 2, avatarSize, 20);
  
    // Level Up text
    ctx.font = '44px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Level Up!', avatarSize + 60, 80);
  
    // Username
    ctx.font = '32px "LEMONMILK-Medium"';
    ctx.fillStyle = '#FF69B4';  // Hot pink
    ctx.fillText(username, avatarSize + 60, 120);
  
    // New Level
    ctx.font = '36px "LEMONMILK-Medium"';
    ctx.fillStyle = '#99AAB5';  // Light grey
    ctx.fillText(`You are now level ${newLevel}!`, avatarSize + 60, 170);
  
    return canvas.toBuffer('image/png');
  }