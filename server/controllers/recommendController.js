const notImplemented = (_req, res) => {
  res.status(501).json({ message: 'Not implemented' })
}

export const getRecommendations = notImplemented
