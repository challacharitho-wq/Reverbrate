const notImplemented = (_req, res) => {
  res.status(501).json({ message: 'Not implemented' })
}

export const listArtists = notImplemented
export const getArtist = notImplemented
export const followArtist = notImplemented
export const unfollowArtist = notImplemented
