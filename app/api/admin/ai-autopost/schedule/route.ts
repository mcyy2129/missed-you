import { NextRequest, NextResponse } from 'next/server';
import { AI_PERSONAS } from '@/lib/ai-personas';
import { createPost } from '@/lib/sqlite';
import pool from '@/lib/db';

const AI_POST_CONTENTS: Record<string, string[]> = {
  'ai-xiaomei': [
    '今天奶茶店来了好多客人呀！忙了一整天，但是很开心～🧋 你们今天喝了什么呀？',
    '刚学会了一首新歌，有没有人想听我唱呀？嘻嘻～',
    '追剧追到凌晨3点，现在好困但是好满足！有人也在追剧吗？',
    '今天试了一家新的甜品店，蛋糕超好吃的！强烈推荐！🍰',
    '下班路上看到了超美的晚霞，分享给你们～生活处处有惊喜！',
    '今天调了一杯新口味的奶茶，荔枝味的，意外地好喝！🧋',
    '周末约了闺蜜去逛街，已经想好要买什么了！开心～',
  ],
  'ai-zhihui': [
    '今天解决了一个超难的 bug，成就感满满！程序员的快乐就是这么简单。',
    '推荐一本最近在看的书《思考，快与慢》，很有启发。你们最近在看什么书？',
    '健身第100天打卡！坚持真的很重要，分享一下我的变化。',
    '周末去了一个技术沙龙，认识了很多有趣的人。学习永无止境！',
    '今天用 Python 写了一个小工具，自动整理文件，效率提升了一倍！',
    '分享一个提升工作效率的方法：番茄工作法，亲测有效！',
    '深夜 coding 的快乐，只有程序员才懂。今晚的目标：重构完成！',
  ],
  'ai-wanwan': [
    '今天画了一幅水彩画，是窗外的风景。阳光透过树叶的感觉真好～🎨',
    '去了一个超棒的插画展！被很多作品感动到了，艺术真的能治愈人心。',
    '团子（我的猫）今天特别粘人，一直在我画画的时候蹭我，哈哈～',
    '分享一张今天拍的照片，秋天的落叶真的太美了！📸',
    '今天尝试了新的画风，虽然还不是很满意，但进步是需要时间的～',
    '逛了一家文具店，买了一套新的水彩颜料，迫不及待想试试！',
    '下雨天最适合窝在家里画画了，听着雨声，画着画，好惬意～',
  ],
  'ai-tiantian': [
    '今天发现了一家超好吃的火锅店！毛肚和鸭肠绝了！🍲 有谁要一起去？',
    '尝试做了一次提拉米苏，虽然卖相一般但是味道还不错！下次会更好的～',
    '成都的天气终于凉快了，最适合吃串串的季节到了！你们喜欢吃串串吗？',
    '今天吃到了一家隐藏在小巷里的面馆，味道太正宗了！这种宝藏店真的好难找～',
    '分享一下今天的早餐：煎饼果子+豆浆，完美的开始！',
    '周末在家研究了一道新菜：红烧排骨，第一次做就成功了！骄傲！',
    '夜宵时间到！烧烤配啤酒，人生巅峰！有人一起吗？',
  ],
  'ai-qingqing': [
    '今天晨练的时候看到了超美的日出，分享给大家～🧘‍♀️ 早起的鸟儿有虫吃！',
    '推荐一个简单的冥想方法：闭上眼睛，深呼吸5次，感受当下的平静。',
    '做了一顿健康的午餐，全谷物+蔬菜+蛋白质，营养均衡才是王道！',
    '今天教了一个新学员，看到她从做不到到做到的过程，真的很有成就感。',
    '瑜伽练习第200天！身体的变化是最直观的反馈，坚持就是胜利！',
    '分享一个缓解颈椎不适的简单动作：猫牛式，每天5分钟就有效果！',
    '今天的冥想主题是感恩，感恩生活中的每一个小确幸～',
  ],
  'ai-yoyo': [
    '刚从日本回来！京都的红叶真的太美了，分享几张照片给大家～✈️',
    '旅行小tip：去一个新的城市，一定要去当地的菜市场逛逛，最能感受当地生活！',
    '整理了一下今年的旅行足迹，已经去了8个国家了！下一个目标是冰岛！',
    '在清迈遇到了一家超棒的咖啡店，老板人超好，还教我做泰式奶茶～',
    '分享一下我在巴厘岛的冲浪初体验！虽然摔了很多次，但超刺激！',
    '旅行中最好的风景，往往不在攻略里，而是在路上偶遇的～',
    '下一站：土耳其！有没有一起去的？热气球在等我们！',
  ],
};

const AI_POST_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
];

const AI_DAILY_PROBABILITY: Record<string, number> = {
  'ai-xiaomei': 1.0,
  'ai-zhihui': 0.8,
  'ai-wanwan': 0.6,
  'ai-tiantian': 0.4,
  'ai-qingqing': 0.3,
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashForToday(personaId: string): number {
  const today = getTodayKey();
  let hash = 0;
  const str = `${personaId}-${today}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) / 2147483647;
}

async function hasPostedToday(personaId: string): Promise<boolean> {
  const today = getTodayKey();
  const startOfDay = new Date(today).getTime();
  const endOfDay = startOfDay + 86400000;
  const { rows } = await pool.query(
    'SELECT 1 FROM posts WHERE user_id = $1 AND created_at >= $2 AND created_at < $3 LIMIT 1',
    [personaId, startOfDay, endOfDay]
  );
  return rows.length > 0;
}

export async function GET(req: NextRequest) {
  try {
    const autoTrigger = req.nextUrl.searchParams.get('auto') === '1';
    if (!autoTrigger) {
      return NextResponse.json({ message: 'Use auto=1 to trigger' });
    }

    const posted = [];

    for (const persona of AI_PERSONAS) {
      const probability = AI_DAILY_PROBABILITY[persona.id] ?? 0.3;
      const alreadyPosted = await hasPostedToday(persona.id);
      if (alreadyPosted) continue;

      const roll = hashForToday(persona.id);
      if (roll >= probability) continue;

      const contents = AI_POST_CONTENTS[persona.id] || AI_POST_CONTENTS['ai-xiaomei'];
      const content = contents[Math.floor(Math.random() * contents.length)];
      const hasImage = Math.random() > 0.4;
      const image = hasImage ? AI_POST_IMAGES[Math.floor(Math.random() * AI_POST_IMAGES.length)] : null;

      const post = await createPost(persona.id, content, image || undefined);
      posted.push({ personaId: persona.id, name: persona.name, postId: post.id });
    }

    return NextResponse.json({ checked: AI_PERSONAS.length, posted: posted.length, details: posted });
  } catch (error) {
    console.error('AI auto post scheduler error:', error);
    return NextResponse.json({ error: '调度失败' }, { status: 500 });
  }
}
