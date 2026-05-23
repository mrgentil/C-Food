const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dul9gmbzj/image/upload';
const UPLOAD_PRESET = 'c_food';

/**
 * Upload image to Cloudinary (driver documents).
 * @param {string} uri - local file URI
 * @param {string} folder - e.g. driver-documents
 */
export async function uploadDriverDocument(uri, folder = 'driver-documents') {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'document.jpg',
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error('Échec du téléversement');
  }

  return data.secure_url;
}
