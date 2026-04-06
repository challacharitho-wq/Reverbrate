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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscription: user.subscription,
      },
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
