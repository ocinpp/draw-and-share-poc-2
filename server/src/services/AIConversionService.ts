import MockAIService from './MockAIService.js';

type AIProvider = 'mock' | 'local' | 'animegan' | 'replicate';

/**
 * AI Conversion Service
 * Configurable service layer that switches between different AI providers
 */
class AIConversionService {
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || 'mock';
    console.log(`🎨 AI Provider: ${this.provider}`);
    console.log(`📊 Provider Info:`, this.getProviderInfo());
  }

  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    switch (this.provider) {
      case 'mock':
        return MockAIService.convertToAnime(imageBuffer);

      case 'local':
        throw new Error('Local provider not yet implemented. Use mock for MVP.');

      case 'animegan':
        throw new Error('AnimeGAN provider not yet implemented. Use mock for MVP.');

      case 'replicate':
        throw new Error('Replicate provider not yet implemented. Use mock for MVP.');

      default:
        throw new Error(`Unknown AI provider: ${this.provider}`);
    }
  }

  getProviderInfo() {
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
        return {
          name: 'ControlNet (Cloud)',
          cost: 0.005,
          speed: '8-12s',
          quality: 'excellent',
        };

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

