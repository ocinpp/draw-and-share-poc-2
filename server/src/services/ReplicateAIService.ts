import Replicate from 'replicate';
import sharp from 'sharp';

/**
 * Replicate AI Service
 * Uses Replicate's API for high-quality anime conversion
 *
 * Popular models for sketch-to-anime:
 * - jagilley/controlnet-scribble: Good for sketches
 * - rossjillian/controlnet: Alternative ControlNet
 * - stability-ai/sdxl: High quality but slower
 */
class ReplicateAIService {
  private client: Replicate | null = null;
  private initialized = false;

  private initialize() {
    if (!this.initialized) {
      const apiToken = process.env.REPLICATE_API_TOKEN;

      if (!apiToken) {
        console.warn('⚠️  REPLICATE_API_TOKEN not set. Replicate service will not work.');
        console.warn('   Get your token at: https://replicate.com/account/api-tokens');
      } else {
        this.client = new Replicate({
          auth: apiToken,
        });
        console.log('✅ Replicate client initialized');
      }

      this.initialized = true;
    }
  }

  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    this.initialize();

    if (!this.client) {
      throw new Error('Replicate API token not configured. Please set REPLICATE_API_TOKEN in .env');
    }

    console.log('🎨 Replicate AI: Converting to anime style...');

    try {
      // Convert buffer to base64 data URL
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      // Use ControlNet Scribble model for sketch-to-anime
      // This model is specifically designed for converting sketches
      const output = await this.client.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        {
          input: {
            image: base64Image,
            prompt: "anime style, vibrant colors, clean lines, professional anime artwork, high quality",
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy",
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 20,
          }
        }
      );

      console.log('📦 Replicate output:', output);

      // Output is typically an array of URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (typeof imageUrl !== 'string') {
        throw new Error('Unexpected output format from Replicate');
      }

      // Fetch the image from the URL
      console.log('📥 Downloading image from:', imageUrl);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const downloadedBuffer = Buffer.from(arrayBuffer);

      // Resize to consistent size
      const processedBuffer = await sharp(downloadedBuffer)
        .resize(512, 512, { fit: 'contain', background: '#ffffff' })
        .png()
        .toBuffer();

      console.log('✅ Replicate AI: Anime conversion complete');
      return processedBuffer;

    } catch (error) {
      console.error('❌ Replicate AI error:', error);
      throw new Error(`Replicate conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getInfo() {
    this.initialize();

    return {
      name: 'Replicate (ControlNet)',
      cost: 0.005,
      speed: '8-12s',
      quality: 'excellent',
      description: 'Cloud-based AI using ControlNet for sketch-to-anime conversion',
      configured: !!this.client,
    };
  }
}

export default new ReplicateAIService();

