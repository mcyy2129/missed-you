import { NextRequest } from 'next/server'

const NET_EASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return new Response('Missing url parameter', { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: NET_EASE_HEADERS,
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return new Response(`Upstream error: ${res.status}`, { status: res.status })
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg'
    const contentLength = res.headers.get('content-length')

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    }
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }

    return new Response(res.body, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('[music/stream] Proxy error:', error.message)
    return new Response('Proxy fetch failed', { status: 502 })
  }
}
