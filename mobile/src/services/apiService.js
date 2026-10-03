/**
 * apiService.js
 * ─────────────
 * Connects the React Native app to the FastAPI backend.
 * Handles image upload and returns the AI analysis verdict.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Backend URL Configuration
// Physical phone:  uses your PC's local IP on same WiFi network
// Android emulator: uses 10.0.2.2 (maps to host machine's localhost)
// ─────────────────────────────────────────────────────────────────────────────
const PHYSICAL_DEVICE_URL = 'http://10.138.219.125:8000';
const EMULATOR_URL = 'http://10.0.2.2:8000';

// Change this to EMULATOR_URL if testing on Android emulator
export const API_BASE_URL = PHYSICAL_DEVICE_URL;

/**
 * Analyze an image for AI generation.
 *
 * @param {string} imageUri - Local URI of the image (from expo-image-picker)
 * @param {string} mimeType - MIME type of the image (e.g. 'image/jpeg')
 * @param {string} fileName - File name (e.g. 'photo.jpg')
 * @returns {Promise<Object>} Verdict object from backend
 */
export async function analyzeImage(imageUri, mimeType = 'image/jpeg', fileName = 'image.jpg') {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: mimeType,
    name: fileName,
  });

  const response = await fetch(`${API_BASE_URL}/analyze-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Check if the backend API is healthy and model is loaded.
 * @returns {Promise<Object>} Health status object
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Backend is not reachable');
  return response.json();
}
