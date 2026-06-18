import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getDataFilePath(file: string) {
  return path.join(process.cwd(), 'data', 'blog', file)
}

function readData(file: string) {
  const fp = getDataFilePath(file)
  if (!fs.existsSync(fp)) return []
  const content = fs.readFileSync(fp, 'utf8')
  const marker = '= ['
  const idx = content.lastIndexOf(marker)
  if (idx === -1) return []
  const arrStart = idx + marker.length - 1
  const arrEnd = content.lastIndexOf('];')
  if (arrEnd === -1 || arrEnd < arrStart) return []
  let arrStr = content.substring(arrStart, arrEnd + 1)
  arrStr = arrStr.replace(/,\s*\]/g, ']')
  try { return JSON.parse(arrStr) } catch { return [] }
}

function writeData(file: string, data: any[]) {
  const fp = getDataFilePath(file)
  const dir = path.dirname(fp)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const typeName = file.replace('.ts', '').replace(/-/g, '_')
  let content = ''
  if (file === 'projects.ts') {
    content = `export type Project = { id: string; name: string; description: string; icon: string; githubUrl: string; tags: string[]; };\n\nexport const projectsData: Project[] = ${JSON.stringify(data, null, 2)};`
  } else if (file === 'friends.ts') {
    content = `export interface Friend { id: string; name: string; url: string; description: string; avatar: string; themeColor: string; }\n\nexport const friendsData: Friend[] = ${JSON.stringify(data, null, 2)};`
  } else if (file === 'albums.ts') {
    content = `export interface Photo { url: string; caption?: string; }\nexport interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }\n\nexport const albums: Album[] = ${JSON.stringify(data, null, 2)};`
  }
  fs.writeFileSync(fp, content, 'utf8')
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file') || 'projects.ts'
  try {
    const data = readData(file)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { file, item } = body
  try {
    const data = readData(file)
    data.push(item)
    writeData(file, data)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { file, id, item } = body
  try {
    let data = readData(file)
    data = data.map((d: any) => d.id === id ? { ...d, ...item } : d)
    writeData(file, data)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { file, id } = body
  try {
    let data = readData(file)
    data = data.filter((d: any) => d.id !== id)
    writeData(file, data)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
