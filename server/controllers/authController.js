import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const SALT_ROUNDS = 10
const JWT_EXPIRES = '7d'

function signToken(userId) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign({ id: userId.toString() }, secret, { expiresIn: JWT_EXPIRES })
}

function userResponse(doc) {
  const u = doc.toObject ? doc.toObject() : doc
  delete u.password
  return u
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password required',
      })
    }

    const normalizedName = String(name).trim()
    const normalizedEmail = String(email).toLowerCase().trim()
    const normalizedPassword = String(password)

    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(normalizedPassword, SALT_ROUNDS)
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashed,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.status(201).json({
      token,
      user: userResponse(user),
    })
  } catch (err) {
    console.error('[auth] register error:', err)
    res.status(500).json({
      message: err.message || 'Server error',
    })
  }
}

export async function login(req, res) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' })
    }

    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const match = await bcrypt.compare(String(password), user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user._id)
    return res.status(200).json({
      token,
      user: userResponse(user),
    })
  } catch {
    return res.status(500).json({ message: 'Login failed' })
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ user: userResponse(user) })
  } catch {
    return res.status(500).json({ message: 'Failed to load profile' })
  }
}

export async function toggleLike(req, res) {
  try {
    const { youtubeId, title, artist, thumbnail } = req.body

    if (!youtubeId) {
      return res.status(400).json({ message: 'youtubeId is required' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const existingIndex = user.likedSongs.findIndex(
      (song) => song.youtubeId === String(youtubeId).trim(),
    )

    if (existingIndex >= 0) {
      user.likedSongs.splice(existingIndex, 1)
      await user.save()
      return res.status(200).json({ liked: false, songs: user.likedSongs })
    }

    user.likedSongs.push({
      youtubeId: String(youtubeId).trim(),
      title: String(title || '').trim(),
      artist: String(artist || '').trim(),
      thumbnail: String(thumbnail || '').trim(),
      likedAt: new Date(),
    })

    await user.save()
    return res.status(200).json({ liked: true, songs: user.likedSongs })
  } catch (err) {
    console.error('[auth] toggleLike error:', err)
    return res.status(500).json({ message: 'Failed to update liked songs' })
  }
}

export async function getLikedSongs(req, res) {
  try {
    const user = await User.findById(req.user.id).select('likedSongs')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ songs: user.likedSongs || [] })
  } catch (err) {
    console.error('[auth] getLikedSongs error:', err)
    return res.status(500).json({ message: 'Failed to load liked songs' })
  }
}

export async function savePreferences(req, res) {
  try {
    const artists = Array.isArray(req.body.artists)
      ? req.body.artists
          .map((artist) => String(artist || '').trim())
          .filter(Boolean)
      : []

    const uniqueArtists = [...new Set(artists)]

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferredArtists: uniqueArtists,
        onboardingDone: true,
      },
      {
        new: true,
      },
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({
      success: true,
      user: userResponse(user),
    })
  } catch (err) {
    console.error('[auth] savePreferences error:', err)
    return res.status(500).json({ message: 'Failed to save preferences' })
  }
}
