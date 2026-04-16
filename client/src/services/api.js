import axios from 'axios'

export const AUTH_TOKEN_KEY = 'reverberate_token'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ||
           'http://localhost:5000/api',
})

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

// On 401 — clear token and redirect
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    if (
      err.response?.status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register')
    ) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  savePreferences: (data) =>
  API.post('/auth/preferences', data),
}

export const likeAPI = {
  toggleLike: (track) => API.post('/auth/like', track),
  getLikes: () => API.get('/auth/likes'),
}

// ─── Music / Songs ───────────────────────────────────
export const musicAPI = {
  search: (query) =>
    API.get(`/songs/search?query=${encodeURIComponent(query)}`),

  getTrackDetails: (youtubeId, title, artist, thumbnail) =>
    API.get('/songs/track/details', {
      params: { youtubeId, title, artist, thumbnail }
    }),

  uploadTrack: (formData) =>
    API.post('/songs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getMyUploads: () => API.get('/songs/my-uploads'),

  deleteUpload : (id) => API.delete(`/songs/${id}`),
}

// ─── History ─────────────────────────────────────────
export const historyService = {
  add: (trackId, sourceType, title, artist, thumbnail) =>
    API.post('/history', {
      trackId, sourceType, title, artist, thumbnail
    }),
  get   : () => API.get('/history'),
  clear : () => API.delete('/history'),
}

// ─── Recommendations ─────────────────────────────────
export const recommendService = {
  get: () => API.get('/recommendations'),
}

// ─── Artists ─────────────────────────────────────────
export const artistService = {
  follow: (artistName, artistImage, artistBio,
           artistTags, artistListeners) =>
    API.post('/artists/follow', {
      artistName, artistImage, artistBio,
      artistTags, artistListeners
    }),

  getFollowing   : ()           => API.get('/artists/following'),

  checkFollowing : (artistName) =>
    API.get('/artists/check', { params: { artistName } }),
}

// ─── Playlists ─────────────────────────────────────────
export const playlistAPI = {
  createPlaylist: (name) => API.post('/playlists', { name }),
  getUserPlaylists: () => API.get('/playlists'),
  getPlaylist: (id) => API.get(`/playlists/${id}`),
  addTrack: (id, track) => API.post(`/playlists/${id}/tracks`, track),
  removeTrack: (id, youtubeId) =>
    API.delete(`/playlists/${id}/tracks`, {
      params: { youtubeId },
    }),
}

// Alias for backward compatibility
export const songService = musicAPI;

export const api = API

export default API
