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
type VideoModel = 'hailuo' | 'seedance';

class ReplicateAIService {
  private client: Replicate | null = null;
  private initialized = false;
  private videoModel: VideoModel = 'seedance';

  private initialize() {
    if (!this.initialized) {
      const apiToken = process.env.REPLICATE_API_TOKEN;
      const videoModelEnv = process.env.VIDEO_MODEL?.toLowerCase();

      // Set video model from environment
      if (videoModelEnv === 'hailuo' || videoModelEnv === 'seedance') {
        this.videoModel = videoModelEnv;
      }

      if (!apiToken) {
        console.warn('⚠️  REPLICATE_API_TOKEN not set. Replicate service will not work.');
        console.warn('   Get your token at: https://replicate.com/account/api-tokens');
      } else {
        this.client = new Replicate({
          auth: apiToken,
        });
        console.log('✅ Replicate client initialized');
        console.log(`🎬 Video model: ${this.videoModel}`);
      }

      this.initialized = true;
    }
  }

  /**
   * Analyze the drawing to identify what's in it
   * Uses LLaVA vision model which is better at understanding sketches
   */
  private async analyzeDrawing(base64Image: string): Promise<string> {
    if (!this.client) {
      return '';
    }

    try {
      console.log('🔍 Analyzing drawing with LLaVA...');

      const output = await this.client.run(
        "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
        {
          input: {
            image: base64Image,
            prompt: "What is the main subject or object in this drawing? Answer in 3-5 words only, describing what you see.",
          }
        }
      );

      // LLaVA returns a string description
      let description = '';
      if (typeof output === 'string') {
        description = output;
      } else if (Array.isArray(output)) {
        description = output.join('');
      }

      // Clean up the description - remove common prefixes
      description = description
        .replace(/^(the main subject is|this is a drawing of|i see|the image shows?)\s*/i, '')
        .replace(/\.$/, '')
        .trim()
        .toLowerCase();

      console.log('🔍 LLaVA detected:', description);

      return description;
    } catch (error) {
      console.warn('⚠️  LLaVA analysis failed, using generic prompt:', error);
      return '';
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

      // Use a simple, universal prompt that works for any drawing
      // Don't try to identify content - just focus on style
      const prompt = "colorful anime drawing";

      console.log('📝 Using prompt:', prompt);

      // Use ControlNet Scribble to convert to anime style
      const output = await this.client.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        {
          input: {
            image: base64Image,
            prompt: prompt,
            negative_prompt: "complex scene, detailed background, multiple objects, extra elements, photorealistic, 3d render",
            num_inference_steps: 20,
            guidance_scale: 5.0,  // Lower = less creative interpretation
            // Very high conditioning scale = stay extremely close to the input sketch
            controlnet_conditioning_scale: 2.0,
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

  /**
   * Animate an image using selected video model
   * - hailuo: MiniMax hailuo-02-fast - 6s, 512p, $0.10/video
   * - seedance: ByteDance seedance-1-lite - 4s, 480p, $0.072/video
   * Returns a video URL (mp4)
   */
  async animateImage(imageBuffer: Buffer, prompt?: string): Promise<string> {
    this.initialize();

    if (!this.client) {
      throw new Error('Replicate API token not configured. Please set REPLICATE_API_TOKEN in .env');
    }

    const modelName = this.videoModel === 'hailuo' ? 'MiniMax hailuo-02-fast' : 'ByteDance seedance-1-lite';
    console.log(`🎬 Replicate AI: Animating image with ${modelName}...`);
    console.log('📦 Image buffer size:', imageBuffer.length, 'bytes');

    try {
      // Pass the Buffer directly - Replicate client will automatically upload it
      console.log('📦 Passing image buffer directly to Replicate for automatic upload');

      // Creative animation prompt that preserves the original drawing style
      const animationPrompt = prompt ||
        "Animate this image in whatever way you think is most fitting, engaging, and creative. Preserve the exact original style, line thickness, colors, and overall aesthetic—do not add any extra details, elements, or changes. Bring the subject to life with natural, smooth, and fluid motion. Surprise me with your best interpretation. Short looping video, high quality.";

      console.log('📝 Animation prompt:', animationPrompt);

      let output;

      if (this.videoModel === 'hailuo') {
        // MiniMax hailuo-02-fast: 6s, 512p, $0.10
        output = await this.client.run(
          "minimax/hailuo-02-fast",
          {
            input: {
              first_frame_image: imageBuffer,
              prompt: animationPrompt,
              prompt_optimizer: true,
              duration: 6,
            }
          }
        );
      } else {
        // ByteDance seedance-1-lite: 4s, 480p, $0.072
        output = await this.client.run(
          "bytedance/seedance-1-lite",
          {
            input: {
              image: imageBuffer,
              prompt: animationPrompt,
              duration: 4,
              resolution: "480p",
            }
          }
        );
      }

      console.log('📦 MiniMax output type:', typeof output);

      // MiniMax returns a single video URL string
      let videoUrl: string;

      if (typeof output === 'string') {
        videoUrl = output;
      } else if (output && typeof output === 'object' && 'getReader' in output) {
        // Handle ReadableStream - download and save locally
        console.log('📥 Reading video from stream...');
        const stream = output as ReadableStream<Uint8Array>;
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        // Save video to output directory
        const outputDir = path.join(process.cwd(), 'output');
        await fs.mkdir(outputDir, { recursive: true });

        const timestamp = Date.now();
        const videoPath = path.join(outputDir, `animation-${timestamp}.mp4`);
        await fs.writeFile(videoPath, Buffer.from(combined));

        console.log('💾 Saved video to:', videoPath);

        // Return as base64 data URL for socket transmission
        videoUrl = `data:video/mp4;base64,${Buffer.from(combined).toString('base64')}`;
      } else {
        console.error('❌ Unexpected output format from MiniMax:', output);
        throw new Error('Unexpected output format from MiniMax');
      }

      console.log('✅ Replicate AI: Animation complete');
      console.log('🎬 Video URL length:', videoUrl.length);

      return videoUrl;

    } catch (error) {
      console.error('❌ Replicate animation error:', error);
      throw new Error(`Animation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  getVideoInfo() {
    this.initialize();

    if (this.videoModel === 'hailuo') {
      return {
        name: 'MiniMax hailuo-02-fast',
        cost: 0.10,
        speed: '15-30s',
        quality: 'good (512p)',
        duration: '6s',
        description: 'Fast video generation with prompt optimization',
        configured: !!this.client,
      };
    }

    // Default: seedance
    return {
      name: 'ByteDance seedance-1-lite',
      cost: 0.072,
      speed: '10-20s',
      quality: 'good (480p)',
      duration: '4s',
      description: 'Cost-effective video generation by ByteDance',
      configured: !!this.client,
    };
  }
}

export default new ReplicateAIService();

