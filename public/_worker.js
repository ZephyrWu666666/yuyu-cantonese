export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // Only handle audio files
    if (!path.startsWith('/songs/') && !path.startsWith('/audio/')) {
      return env.ASSETS.fetch(request)
    }

    const range = request.headers.get('Range')

    // If no range header, just pass through
    if (!range) {
      return env.ASSETS.fetch(request)
    }

    // Forward range request directly to asset store
    const response = await env.ASSETS.fetch(request)
    if (!response.ok) return response

    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  },
}
