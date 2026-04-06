import { useState } from 'react'
import { Upload as UploadIcon, Music } from 'lucide-react'
import toast from 'react-hot-toast'
import { musicAPI } from '../services/api.js'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: 'Other',
  })

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
        toast.error('Please select an audio file')
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
        toast.error('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)

      // Auto-fill title from filename if empty
      if (!formData.title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
        setFormData(prev => ({ ...prev, title: nameWithoutExt }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }
    if (!formData.title || !formData.artist) {
      toast.error('Title and artist are required')
      return
    }

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('audio', file)
      uploadData.append('title', formData.title)
      uploadData.append('artist', formData.artist)
      uploadData.append('album', formData.album)
      uploadData.append('genre', formData.genre)

      await musicAPI.uploadTrack(uploadData)
      toast.success('Track uploaded successfully!')

      // Reset form
      setFile(null)
      setFormData({
        title: '',
        artist: '',
        album: '',
        genre: 'Other',
      })
      // Reset file input
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white">Upload Music</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Upload your own MP3 files to add to your personal library. Files are stored securely in the cloud.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Audio File *
            </label>
            <div className="relative">
              <input
                id="file-input"
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 p-8 transition hover:border-zinc-500"
              >
                <div className="text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-zinc-400" />
                  <p className="mt-2 text-sm text-zinc-400">
                    {file ? file.name : 'Click to select MP3 file'}
                  </p>
                  <p className="text-xs text-zinc-500">Max 50MB</p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-400 focus:border-purple-500 focus:outline-none"
                placeholder="Song title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Artist *
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-400 focus:border-purple-500 focus:outline-none"
                placeholder="Artist name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Album
              </label>
              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-400 focus:border-purple-500 focus:outline-none"
                placeholder="Album name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Other">Other</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Electronic">Electronic</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Country">Country</option>
                <option value="R&B">R&B</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: uploading || !file ? 'var(--bg-hover)' : 'var(--accent)',
                color: 'var(--text-primary)',
              }}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4" />
                  Upload Track
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}