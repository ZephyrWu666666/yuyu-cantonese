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

    // Fetch the full file WITHOUT range header
    const fullRequest = new Request(request.url, { method: 'GET' })
    const response = await env.ASSETS.fetch(fullRequest)
    if (!response.ok) return response

    const buffer = await response.arrayBuffer()
    const total = buffer.byteLength

    if (total === 0) {
      return new Response('File not found', { status: 404 })
    }

    // Parse range
    const match = range.match(/bytes=(\d+)-(\d*)/)
    if (!match) {
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(total),
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const start = parseInt(match[1], 10)
    const end = match[2] ? parseInt(match[2], 10) : total - 1
    const chunk = buffer.slice(start, end + 1)

    return new Response(chunk, {
      status: 206,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(chunk.byteLength),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  },
}
