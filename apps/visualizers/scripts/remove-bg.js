import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/images/mascot/origin.png');
const OUTPUT_FILE = path.join(__dirname, '../public/images/mascot/origin.png'); // overwrite

const TOLERANCE = 40; // Threshold for considering a pixel "magenta"

function isBackground(r, g, b) {
  // Check if the pixel is primarily magenta
  return r > 150 && b > 150 && g < 100;
}

async function removeBackground() {
  try {
    console.log(`Loading ${INPUT_FILE}...`);
    const image = await Jimp.read(INPUT_FILE);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height * 2);
    let head = 0;
    let tail = 0;

    const push = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      queue[tail++] = x;
      queue[tail++] = y;
    };

    // Add all edge pixels to the queue
    for (let x = 0; x < width; x++) {
      push(x, 0);
      push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      push(0, y);
      push(width - 1, y);
    }

    console.log('Flood filling from edges...');

    let count = 0;
    while (head < tail) {
      const x = queue[head++];
      const y = queue[head++];

      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;

      if (isBackground(r, g, b)) {
        // Set alpha to 0 (r, g, b, 0)
        const newHex = ((r << 24) | (g << 16) | (b << 8) | 0) >>> 0;
        image.setPixelColor(newHex, x, y);

        // Add neighbors
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
        count++;
      }
    }

    console.log(`Cleared ${count} background pixels.`);
    console.log('Saving image...');
    await image.write(OUTPUT_FILE);
    console.log('Background removed successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeBackground();
