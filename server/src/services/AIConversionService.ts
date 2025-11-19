import MockAIService from './MockAIService.js';
import ReplicateAIService from './ReplicateAIService.js';

type AIProvider = 'mock' | 'local' | 'animegan' | 'replicate';

/**
 * AI Conversion Service
 * Configurable service layer that switches between different AI providers
 */
class AIConversionService {
  private provider: AIProvider;
  private initialized: boolean = false;

  constructor() {
    // Don't read env vars in constructor - they might not be loaded yet
    this.provider = 'mock';
  }

  private initialize() {
    if (!this.initialized) {
      this.provider = (process.env.AI_PROVIDER as AIProvider) || 'mock';
      this.initialized = true;
      console.log(`🎨 AI Provider: ${this.provider}`);
      console.log(`📊 Provider Info:`, this.getProviderInfo());
    }
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
}

export default new AIConversionService();

