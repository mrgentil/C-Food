import Constants from 'expo-constants';

function getExtra() {
  return (
    (Constants.expoConfig && Constants.expoConfig.extra) ||
    (Constants.manifest && Constants.manifest.extra) ||
    (Constants.manifest2 && Constants.manifest2.extra) ||
    {}
  );
}

const extra = getExtra();

function deriveReverbHost(apiBase) {
  try {
    return new URL(apiBase.replace(/\/api\/?$/, '')).hostname;
  } catch {
    return '127.0.0.1';
  }
}

const apiBase = extra.API_BASE_URL || 'http://127.0.0.1:8000/api';

export const config = {
  API_BASE_URL: apiBase,
  REVERB_APP_KEY: extra.REVERB_APP_KEY || extra.PUSHER_KEY || 'cfood-local-key',
  REVERB_HOST: extra.REVERB_HOST || deriveReverbHost(apiBase),
  REVERB_PORT: Number(extra.REVERB_PORT ?? 6001),
  REVERB_SCHEME: extra.REVERB_SCHEME || 'http',
  /** Rayon d'affichage des commandes disponibles (km, doit correspondre à l'API). */
  DELIVERY_VISIBLE_RADIUS_KM: Number(extra.DELIVERY_VISIBLE_RADIUS_KM ?? 8),
  SUPPORT_PHONE: extra.SUPPORT_PHONE || '+243812380589',
  SUPPORT_EMAIL: extra.SUPPORT_EMAIL || 'chadkabengele@gmail.com',
  CLOUDINARY_URL: extra.CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/dul9gmbzj/image/upload',
  CLOUDINARY_UPLOAD_PRESET: extra.CLOUDINARY_UPLOAD_PRESET || 'c_food',
};

