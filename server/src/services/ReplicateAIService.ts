import Replicate from 'replicate';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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

      // Use ControlNet Scribble - focus on preserving the exact drawing
      const output = await this.client.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        {
          input: {
            image: base64Image,
            // Universal prompt: Only describe style, not content
            // This works for any drawing (person, animal, object, etc.)
            prompt: "anime art style, vibrant colors, clean outlines",
            negative_prompt: "photograph, realistic, 3d, blurry, low quality, extra elements, background details",
            num_inference_steps: 20,
            guidance_scale: 7.5,
            // High conditioning scale = stay very close to the input sketch
            controlnet_conditioning_scale: 1.5,
          }
        }
      );

      console.log('📦 Replicate output type:', typeof output);
      console.log('📦 Is array:', Array.isArray(output));
      console.log('📦 Number of outputs:', Array.isArray(output) ? output.length : 0);

      // The output can be either URLs or ReadableStreams depending on SDK version
      if (!Array.isArray(output) || output.length === 0) {
        console.error('❌ No output from Replicate:', output);
        throw new Error('No output received from Replicate');
      }

      // ControlNet returns multiple outputs, use the second one (more faithful to original)
      let imageData: Buffer;
      const outputIndex = output.length > 1 ? 1 : 0;  // Use second output if available
      const selectedOutput = output[outputIndex];

      console.log(`📦 Using output[${outputIndex}] of ${output.length} outputs`);

      // Check if it's a ReadableStream (newer SDK behavior)
      if (selectedOutput && typeof selectedOutput === 'object' && 'getReader' in selectedOutput) {
        console.log('📥 Reading from ReadableStream...');
        const stream = selectedOutput as ReadableStream<Uint8Array>;
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        // Combine all chunks into a single buffer
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        imageData = Buffer.from(combined);
        console.log('✅ Stream read complete, size:', imageData.length, 'bytes');

      } else if (typeof selectedOutput === 'string') {
        // It's a URL string
        console.log('📥 Downloading image from URL:', selectedOutput);
        const response = await fetch(selectedOutput);

        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        imageData = Buffer.from(arrayBuffer);
        console.log('✅ Downloaded image, size:', imageData.length, 'bytes');

      } else {
        console.error('❌ Unexpected output format:', selectedOutput);
        throw new Error('Unexpected output format from Replicate');
      }

      // Resize to consistent size
      const processedBuffer = await sharp(imageData)
        .resize(512, 512, { fit: 'contain', background: '#ffffff' })
        .png()
        .toBuffer();

      // Save to disk for debugging
      const outputDir = path.join(process.cwd(), 'output');
      await fs.mkdir(outputDir, { recursive: true });

      const timestamp = Date.now();
      const outputPath = path.join(outputDir, `replicate-${timestamp}.png`);
      await fs.writeFile(outputPath, processedBuffer);

      console.log('💾 Saved output to:', outputPath);
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

