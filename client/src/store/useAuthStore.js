import { create } from 'zustand'
import { api, AUTH_TOKEN_KEY } from '../services/api.js'

export const useAuthStore = create((set) => ({
  user: null,
  token:
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
    }),

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  loadUserFromStorage: async () => {
    set({ isLoading: true })
    const stored =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null

    if (!stored) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      return
    }

    set({ token: stored })

    try {
      const { data } = await api.get('/auth/me')
      set({
        user: data.user,
        token: stored,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  register: async (name, email, password) => {
    set({ error: null })
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      })
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        error: null,
      })
      return data
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed'
      set({
        error: message,
        isAuthenticated: false,
      })
      throw err
    }
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        error: null,
      })
      return data
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed'
      set({
        error: message,
        isAuthenticated: false,
      })
      throw err
    }
  },
}))
