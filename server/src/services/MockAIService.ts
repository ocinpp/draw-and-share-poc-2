import sharp from 'sharp';

/**
 * Basic Local AI Service
 * Applies anime-style filters using image processing
 */
class MockAIService {
  async convertToAnime(imageBuffer: Buffer): Promise<Buffer> {
    console.log('🎨 Local AI: Converting to anime style...');

    // Apply strong anime-style transformations
    const processed = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'contain', background: '#ffffff' })
      // Very high saturation for vibrant anime colors
      .modulate({
        saturation: 2.5,
        brightness: 1.2,
      })
      // Strong sharpening for clean anime lines
      .sharpen({
        sigma: 3,
        m1: 0,
        m2: 5,
      })
      // High contrast for bold look
      .linear(1.5, -(128 * 1.5) + 128)
      // Normalize to enhance colors
      .normalise()
      // Add a subtle pink border to make it obvious
      .extend({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        background: '#ff69b4',
      })
      .png()
      .toBuffer();

    console.log('✅ Local AI: Anime conversion complete');
    return processed;
  }

  getInfo() {
    return {
      name: 'Local (Basic Filters)',
      cost: 0,
      speed: 'instant',
      quality: 'basic',
      description: 'Applies anime-style filters using image processing',
    };
  }
}

export default new MockAIService();

