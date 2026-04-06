const notImplemented = (_req, res) => {
  res.status(501).json({ message: 'Not implemented' })
}

export const getHistory = notImplemented
export const addHistory = notImplemented
export const clearHistory = notImplemented
