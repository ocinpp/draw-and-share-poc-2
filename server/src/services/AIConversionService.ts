import MockAIService from './MockAIService.js';
import ReplicateAIService from './ReplicateAIService.js';

type AIProvider = 'mock' | 'local' | 'animegan' | 'replicate';
type ConversionMode = 'anime' | 'video-only' | 'both';

/**
 * AI Conversion Service
 * Configurable service layer that switches between different AI providers
 *
 * Conversion Modes:
 * - anime: Sketch → Anime image (no video)
 * - video-only: Sketch → Video directly (preserves original drawing)
 * - both: Sketch → Anime → Video
 */
class AIConversionService {
  private provider: AIProvider;
  private conversionMode: ConversionMode;
  private initialized: boolean = false;

  constructor() {
    // Don't read env vars in constructor - they might not be loaded yet
    this.provider = 'mock';
    this.conversionMode = 'anime';
  }

  private initialize() {
    if (!this.initialized) {
      this.provider = (process.env.AI_PROVIDER as AIProvider) || 'mock';
      this.conversionMode = (process.env.CONVERSION_MODE as ConversionMode) || 'anime';
      this.initialized = true;
      console.log(`🎨 AI Provider: ${this.provider}`);
      console.log(`🔄 Conversion Mode: ${this.conversionMode}`);
      console.log(`📊 Provider Info:`, this.getProviderInfo());
    }
  }

  /**
   * Get the current conversion mode
   */
  getConversionMode(): ConversionMode {
    this.initialize();
    return this.conversionMode;
  }

  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    this.initialize(); // Ensure we've read env vars

    switch (this.provider) {
      case 'mock':
        return MockAIService.convertToAnime(imageBuffer);

      case 'local':
        throw new Error('Local provider not yet implemented. Use mock for MVP.');

      case 'animegan':
        throw new Error('AnimeGAN provider not yet implemented. Use mock for MVP.');

      case 'replicate':
        return ReplicateAIService.convertToAnime(imageBuffer);

      default:
        throw new Error(`Unknown AI provider: ${this.provider}`);
    }
  }

  /**
   * Animate an anime image into a video
   * Only available for Replicate provider
   */
  async animateImage(imageBuffer: Buffer, prompt?: string): Promise<string> {
    this.initialize();

    if (this.provider !== 'replicate') {
      throw new Error('Animation is only available with the Replicate provider');
    }

    return ReplicateAIService.animateImage(imageBuffer, prompt);
  }

  /**
   * Check if animation is available
   */
  isAnimationAvailable(): boolean {
    this.initialize();
    return this.provider === 'replicate';
  }

  getProviderInfo() {
    this.initialize(); // Ensure we've read env vars

    switch (this.provider) {
      case 'mock':
        return MockAIService.getInfo();

      case 'local':
        return {
          name: 'Local Filters',
          cost: 0,
          speed: '<100ms',
          quality: 'low',
        };

      case 'animegan':
        return {
          name: 'AnimeGAN (Local)',
          cost: 0,
          speed: '2-3s',
          quality: 'good',
        };

      case 'replicate':
        return ReplicateAIService.getInfo();

      default:
        return {
          name: 'Unknown',
          cost: 0,
          speed: 'unknown',
          quality: 'unknown',
        };
    }
  }

  getVideoProviderInfo() {
    this.initialize();

    if (this.provider === 'replicate') {
      return ReplicateAIService.getVideoInfo();
    }

    return null;
  }
}

export default new AIConversionService();

