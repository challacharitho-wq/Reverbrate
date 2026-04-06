import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = header.slice('Bearer '.length).trim()
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'Server configuration error' })
  }

  try {
    const decoded = jwt.verify(token, secret)
    const id = decoded.id
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = { id: String(id) }
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
