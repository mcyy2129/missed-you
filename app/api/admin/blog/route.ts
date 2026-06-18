import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'posts'
  const dir = type === 'chatters' ? 'chatters' : type === 'moments' ? 'moments' : 'posts'
  const dirPath = path.join(process.cwd(), dir)

  try {
    if (!fs.existsSync(dirPath)) return NextResponse.json({ items: [] })
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))
    const items = files.map(f => {
      const raw = fs.readFileSync(path.join(dirPath, f), 'utf8')
      const { data, content } = matter(raw)
      return {
        id: f.replace('.md', ''),
        ...data,
        content: content.trim(),
        filename: f,
      }
    }).sort((a: any, b: any) => {
      const da = new Date(a.date || 0).getTime()
      const db = new Date(b.date || 0).getTime()
      return db - da
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, filename, title, content, date, tags, cover, description, mood } = body

  const dir = type === 'chatters' ? 'chatters' : type === 'moments' ? 'moments' : 'posts'
  const dirPath = path.join(process.cwd(), dir)

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })

  const fname = filename || `${Date.now()}.md`
  const frontmatter: any = { title: title || '', date: date || new Date().toISOString() }
  if (tags) frontmatter.tags = tags
  if (cover) frontmatter.cover = cover
  if (description) frontmatter.description = description
  if (mood) frontmatter.mood = mood

  let raw = '---\n'
  for (const [k, v] of Object.entries(frontmatter)) {
    raw += `${k}: ${JSON.stringify(v)}\n`
  }
  raw += '---\n\n' + (content || '')

  fs.writeFileSync(path.join(dirPath, fname), raw, 'utf8')
  return NextResponse.json({ success: true, filename: fname })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { type, filename, title, content, date, tags, cover, description, mood } = body

  const dir = type === 'chatters' ? 'chatters' : type === 'moments' ? 'moments' : 'posts'
  const filePath = path.join(process.cwd(), dir, filename)

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  const frontmatter: any = { title: title || '', date: date || new Date().toISOString() }
  if (tags) frontmatter.tags = tags
  if (cover) frontmatter.cover = cover
  if (description) frontmatter.description = description
  if (mood) frontmatter.mood = mood

  let raw = '---\n'
  for (const [k, v] of Object.entries(frontmatter)) {
    raw += `${k}: ${JSON.stringify(v)}\n`
  }
  raw += '---\n\n' + (content || '')

  fs.writeFileSync(filePath, raw, 'utf8')
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { type, filename } = body

  const dir = type === 'chatters' ? 'chatters' : type === 'moments' ? 'moments' : 'posts'
  const filePath = path.join(process.cwd(), dir, filename)

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  fs.unlinkSync(filePath)
  return NextResponse.json({ success: true })
}
