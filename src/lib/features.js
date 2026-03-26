/**
 * SCAS FEATURE FLAGS (Frontend)
 * Controls visibility of 'Experimental' and 'Future' UI modules.
 */

export const FEATURE_FLAGS = {
  // Enables AI Vision Diagnosis UI on TicketForm
  ENABLE_AI_VISION: process.env.NEXT_PUBLIC_ENABLE_AI_VISION === 'true',

  // Enables Real-Time Geo-Heatmaps for Sub-Heads
  ENABLE_GEO_HEATMAPS: process.env.NEXT_PUBLIC_ENABLE_GEO_HEATMAPS === 'true',

  // Enables Multilingual Voice UI
  ENABLE_VERNACULAR_VOICE: process.env.NEXT_PUBLIC_ENABLE_VERNACULAR_VOICE === 'true',
};

/**
 * Helper to check if a feature is active
 */
export const isFeatureActive = (featureName) => {
  return !!FEATURE_FLAGS[featureName];
};
