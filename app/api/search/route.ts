import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

async function searchDuckDuckGoHTML(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const results: SearchResult[] = [];
    
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/g;
    
    let match;
    const links: string[] = [];
    const titles: string[] = [];
    const snippets: string[] = [];
    
    while ((match = resultRegex.exec(html)) !== null) {
      links.push(match[1]);
      titles.push(match[2].replace(/<[^>]*>/g, '').trim());
    }
    
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    
    for (let i = 0; i < Math.min(titles.length, 5); i++) {
      let decodedUrl = links[i] || '';
      const uddgMatch = decodedUrl.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        decodedUrl = decodeURIComponent(uddgMatch[1]);
      }
      
      results.push({
        title: titles[i] || '',
        snippet: snippets[i] || '',
        url: decodedUrl,
      });
    }
    
    return results;
  } catch (error) {
    console.error('DuckDuckGo HTML search error:', error);
    return [];
  }
}

async function searchBing(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.bing.com/search?q=${encodedQuery}&setlang=zh-CN`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const results: SearchResult[] = [];
    
    const liRegex = /<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/g;
    let match;
    
    while ((match = liRegex.exec(html)) !== null && results.length < 5) {
      const block = match[1];
      
      const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      const snippetMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      const urlMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*>/);
      
      if (titleMatch && urlMatch) {
        results.push({
          title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
          snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '',
          url: urlMatch[1],
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encodedQuery}&hl=zh-CN`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const results: SearchResult[] = [];
    
    const divRegex = /<div[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const titleRegex = /<h3[^>]*>([\s\S]*?)<\/h3>/;
    const snippetRegex = /<span[^>]*>([\s\S]*?)<\/span>/;
    
    let match;
    while ((match = divRegex.exec(html)) !== null && results.length < 5) {
      const block = match[1];
      const titleMatch = block.match(titleRegex);
      const snippetMatch = block.match(snippetRegex);
      
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        
        if (title && title.length > 5) {
          results.push({
            title,
            snippet,
            url: '',
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '请提供搜索关键词' }, { status: 400 });
    }
    
    let results = await searchDuckDuckGoHTML(query);
    
    if (results.length === 0) {
      results = await searchBing(query);
    }
    
    if (results.length === 0) {
      results = await searchGoogle(query);
    }
    
    if (results.length === 0) {
      return NextResponse.json({
        query,
        results: [],
        summary: `关于"${query}"的搜索暂时没有找到结果。`,
      });
    }
    
    const summary = results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`).join('\n\n');
    
    return NextResponse.json({
      query,
      results,
      summary,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: '搜索服务暂时不可用' }, { status: 500 });
  }
}
