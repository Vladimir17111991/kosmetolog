import type { SiteImage, SiteImageSlot } from '../../entities/practice/index.ts';

export const demoSiteImages: Record<SiteImageSlot, SiteImage> = {
  hero: { url: './images/demo/specialist.jpg', width: 1122, height: 1402, isDemo: true },
  studio: { url: './images/demo/studio.jpg', width: 1536, height: 1024, isDemo: true },
};
