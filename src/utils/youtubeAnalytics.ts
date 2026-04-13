export type YouTubeClickPayload = {
  label: string;
  url: string;
  location: string;
};

export function trackYouTubeClick(payload: YouTubeClickPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  const body = JSON.stringify({
    ...payload,
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/youtube-click', blob);
    return;
  }

  void fetch('/api/analytics/youtube-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}