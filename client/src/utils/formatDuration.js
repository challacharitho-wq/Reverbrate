// Format seconds → "3:42"
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Format YouTube ISO 8601 → "3:42"
export const formatYouTubeDuration = (iso) => {
  if (!iso) return '0:00';
  const match = iso.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );
  if (!match) return '0:00';
  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2,'0')}:` +
           `${s.toString().padStart(2,'0')}`;
  }
  return `${m}:${s.toString().padStart(2,'0')}`;
};

// Format listener count → "12.3M"
export const formatListeners = (count) => {
  if (!count) return '';
  const n = parseInt(count);
  if (isNaN(n)) return count;
  if (n >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

// Strip HTML tags + decode entities
export const stripHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g,  '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .trim();
};

// Truncate text
export const truncateText = (str, max) => {
  if (!str) return '';
  return str.length <= max
    ? str
    : str.slice(0, max) + '...';
};
