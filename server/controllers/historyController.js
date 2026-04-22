import History from '../models/History.js'

export async function getHistory(req, res) {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)

    return res.status(200).json({ history })
  } catch (err) {
    console.error('[history] getHistory failed', err)
    return res.status(500).json({ message: 'Failed to load history' })
  }
}

export async function addHistory(req, res) {
  try {
    const {
      trackId,
      sourceType,
      title,
      artist,
      thumbnail,
    } = req.body

    console.log('[history] Adding:', {
      userId: req.user.id,
      trackId,
      sourceType,
      title,
    })

    if (!trackId || !sourceType || !title) {
      return res.status(400).json({
        message: 'trackId, sourceType, and title are required',
      })
    }

    const normalizedTrackId = String(trackId).trim()
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
    const existing = await History.findOne({
      userId: req.user.id,
      trackId: normalizedTrackId,
      playedAt: { $gte: threeMinutesAgo },
    })

    if (existing) {
      return res.status(200).json(existing)
    }

    const entry = await History.create({
      userId: req.user.id,
      trackId: normalizedTrackId,
      sourceType: String(sourceType).trim(),
      title: String(title).trim(),
      artist: String(artist || '').trim(),
      thumbnail: String(thumbnail || '').trim(),
      playedAt: new Date(),
    })

    return res.status(201).json({ success: true, history: entry })
  } catch (err) {
    console.error('[history] addHistory failed', err)
    return res.status(500).json({ message: 'Failed to add history' })
  }
}

export async function clearHistory(req, res) {
  try {
    await History.deleteMany({ userId: req.user.id })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[history] clearHistory failed', err)
    return res.status(500).json({ message: 'Failed to clear history' })
  }
}
