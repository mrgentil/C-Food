const CLOUD_NAME = 'dul9gmbzj';
const UPLOAD_PRESET = 'c_food';

function cloudinaryEndpoint(kind) {
  const resource = kind === 'image' ? 'image' : kind === 'video' ? 'video' : 'raw';
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`;
}

function folderFor(kind) {
  if (kind === 'image') return 'chat-images';
  if (kind === 'video') return 'chat-videos';
  return 'chat-audio';
}

function fileNameFor(uri, kind) {
  const lower = uri.toLowerCase();
  if (kind === 'image') return 'chat.jpg';
  if (kind === 'video') {
    if (lower.includes('.mov')) return 'chat.mov';
    return 'chat.mp4';
  }
  if (lower.includes('.caf')) return 'chat.caf';
  if (lower.includes('.3gp')) return 'chat.3gp';
  if (lower.includes('.wav')) return 'chat.wav';
  if (lower.includes('.mp4') && kind === 'audio') return 'chat.m4a';
  return 'chat.m4a';
}

function mimeFor(uri, kind) {
  const lower = uri.toLowerCase();
  if (kind === 'image') return 'image/jpeg';
  if (kind === 'video') return lower.includes('.mov') ? 'video/quicktime' : 'video/mp4';
  if (lower.includes('.caf')) return 'audio/x-caf';
  if (lower.includes('.3gp')) return 'audio/3gpp';
  if (lower.includes('.wav')) return 'audio/wav';
  if (lower.includes('.mp4') || lower.includes('.m4a')) return 'audio/mp4';
  return 'audio/m4a';
}

export async function uploadChatMedia(uri, kind) {
  const formData = new FormData();
  const name = fileNameFor(uri, kind);
  const mime = mimeFor(uri, kind);

  formData.append('file', {
    uri,
    type: mime,
    name,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folderFor(kind));

  const response = await fetch(cloudinaryEndpoint(kind), {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error(data?.error?.message || 'Échec upload média');
  }

  return {
    url: data.secure_url,
    meta: {
      width: data.width,
      height: data.height,
      duration: data.duration,
      bytes: data.bytes,
      format: data.format,
    },
  };
}
