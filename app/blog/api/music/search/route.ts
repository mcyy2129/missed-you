import { NextRequest, NextResponse } from 'next/server'

const NET_EASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword')
  const limit = request.nextUrl.searchParams.get('limit') || '20'

  if (!keyword) {
    return NextResponse.json({ error: 'Missing keyword parameter' }, { status: 400 })
  }

  try {
    const searchUrl = `https://music.163.com/api/search/get?s=${encodeURIComponent(keyword)}&type=1&limit=${limit}&offset=0`

    const res = await fetch(searchUrl, {
      headers: NET_EASE_HEADERS,
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Search failed: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()

    if (!data.result || !data.result.songs) {
      return NextResponse.json({ songs: [] })
    }

    const songIds = data.result.songs.map((s: any) => s.id)

    let coverMap: Record<number, string> = {}
    try {
      const idsParam = songIds.join(',')
      const detailRes = await fetch(
        `https://music.163.com/api/song/detail/?id=${songIds[0]}&ids=[${idsParam}]`,
        { headers: NET_EASE_HEADERS, signal: AbortSignal.timeout(6000) }
      )
      if (detailRes.ok) {
        const detailData = await detailRes.json()
        if (detailData.songs) {
          detailData.songs.forEach((s: any) => {
            if (s.album?.picUrl) coverMap[s.id] = s.album.picUrl
          })
        }
      }
    } catch {}

    const songs = data.result.songs.map((song: any) => {
      const picUrl = coverMap[song.id] || song.album?.picUrl || ''
      return {
        id: song.id,
        name: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || '未知歌手',
        album: song.album?.name || '',
        cover: picUrl,
        duration: song.duration ? Math.floor(song.duration / 1000) : 0,
        url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`,
      }
    })

    return NextResponse.json({ songs, total: data.result.songCount || 0 })
  } catch (error: any) {
    console.error('[api/music/search] Error:', error.message)
    return NextResponse.json({ error: error.message, songs: [] }, { status: 500 })
  }
}
