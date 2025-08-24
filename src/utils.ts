export const getYouTubeId = (url?: string | null) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    const v = u.searchParams.get('v'); if (v) return v;
    const p = u.pathname.split('/').filter(Boolean);
    const i = p.findIndex(x => ['embed','shorts','v'].includes(x));
    if (i >= 0 && p[i+1]) return p[i+1];
  } catch {}
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

export const getYouTubeThumb = (url?: string | null) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;
};
