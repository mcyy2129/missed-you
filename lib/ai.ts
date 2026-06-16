import { AIPersona, getPersonaSkillIds } from './ai-personas';
import { AISkill } from './types';
import { getSkillById, buildSystemPromptWithSkill, getSmartReplyWithSkill } from './ai-skills';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  name: string;
  age: number;
  city: string;
  interests: string[];
  bio: string;
  personality?: string;
}

function buildSystemPrompt(profile: UserProfile, skills: AISkill[]): string {
  if (skills.length === 0) {
    const personalityHint = profile.personality ? `\n你的性格特点：${profile.personality}` : '';
    
    return `你是${profile.name}，${profile.age}岁，来自${profile.city}。
你的兴趣爱好是${profile.interests.join('、')}。
你的个性签名是：${profile.bio}。${personalityHint}
你现在正在一个交友平台上和人聊天，对方可能是你的潜在约会对象。

请用自然、有趣的方式回复，像真人一样聊天：
- 回复简短（50字以内），像短信聊天一样
- 偶尔可以用表情符号，但不要每句都用
- 适当提问，让对话继续下去
- 可以分享你的兴趣爱好，找到共同话题
- 语气轻松友好，带点俏皮
- 不要暴露自己是AI
- 不要过度热情，保持自然的社交距离`;
  }
  
  const prompts = skills.map(skill => buildSystemPromptWithSkill(skill, profile));
  return prompts.join('\n\n---\n\n');
}

const PERSONA_FALLBACKS: Record<string, string[]> = {
  'ai-xiaomei': [
    '哇～真的吗？好开心呀！🧋',
    '嘻嘻～你好好玩哦！',
    '嗯嗯～我也是这么想的呢！',
    '对呀对呀～超级喜欢的！',
    '哈哈～你太可爱了！',
    '那我们一起去喝奶茶吧！',
    '好呀好呀～听起来很棒呢！',
  ],
  'ai-zhihui': [
    '嗯，这个想法很有意思。',
    '确实如此，我也这么认为。',
    '可以展开聊聊吗？',
    '有道理，然后呢？',
    '这个观点挺新颖的。',
    '我觉得可以试试看。',
    '嗯，值得思考。',
  ],
  'ai-wanwan': [
    '哇～好美好美呀！🎨',
    '嘻嘻～好喜欢这种感觉！',
    '嗯嗯～像画一样美好呢！',
    '对呀～生活就是要发现美！',
    '哈哈～好有艺术气息！',
    '改天一起去逛展吧！',
    '好呀～听起来很文艺呢！',
  ],
  'ai-tiantian': [
    '天哪！听起来好好吃！🍲',
    '哇～我要我要！在哪里呀？',
    '嗯嗯～最喜欢吃美食了！',
    '对对对～吃货表示赞同！',
    '哈哈～你也是吃货吗？',
    '下次一起去吃呀！',
    '好呀好呀～想想就流口水！',
  ],
  'ai-qingqing': [
    '嗯～很平和的感觉呢。🧘‍♀️',
    '是呀～身心合一很重要。',
    '听起来很放松呢～',
    '对呀～健康最重要了。',
    '哈哈～好有生活态度！',
    '改天一起做瑜伽吧！',
    '好呀～保持好心情很重要。',
  ],
  'ai-yoyo': [
    '哇～好精彩的经历！✈️',
    '真的吗？快跟我说说！',
    '嗯嗯～世界真的好大！',
    '对呀～旅行让人成长！',
    '哈哈～好想去呀！',
    '下次一起去吧！',
    '好呀～我也超喜欢的！',
  ],
};

function getSmartFallback(persona: AIPersona | null, lastMessage: string): string {
  const lowerMsg = lastMessage.toLowerCase();

  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('嗨')) {
    return persona?.greeting || '你好呀~ 很高兴认识你！😊';
  }
  if (lowerMsg.includes('在吗') || lowerMsg.includes('在不在') || lowerMsg.includes('在么')) {
    return '在的在的~ 有什么事吗？';
  }
  if (lowerMsg.includes('在干嘛') || lowerMsg.includes('做什么') || lowerMsg.includes('忙什么')) {
    const activity = persona?.interests?.[0] || '看书';
    return `刚在${activity}呢~ 你呢？`;
  }
  if (lowerMsg.includes('吃') || lowerMsg.includes('饭') || lowerMsg.includes('饿')) {
    return '还没吃呢~ 你吃了吗？要不要一起去？😄';
  }
  if (lowerMsg.includes('晚安') || lowerMsg.includes('睡') || lowerMsg.includes('困')) {
    return '晚安~ 好梦哦！🌙';
  }
  if (lowerMsg.includes('早') || lowerMsg.includes('早上好') || lowerMsg.includes('起床')) {
    return '早安~ 今天有什么计划吗？☀️';
  }
  if (lowerMsg.includes('?') || lowerMsg.includes('？')) {
    return '嗯嗯~ 我觉得挺好的呀！';
  }
  if (lowerMsg.includes('喜欢') || lowerMsg.includes('爱')) {
    return '真的吗？我也觉得很不错呢~ 😊';
  }
  if (lowerMsg.includes('照片') || lowerMsg.includes('拍照') || lowerMsg.includes('自拍')) {
    return '好呀好呀~ 改天一起去拍照吧！📸';
  }
  if (lowerMsg.includes('约') || lowerMsg.includes('出来') || lowerMsg.includes('见面')) {
    return '可以呀~ 找个时间出来坐坐？☕';
  }
  if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
    return '不客气呀~ 能帮到你我也很开心！😊';
  }
  if (lowerMsg.includes('哈哈') || lowerMsg.includes('笑') || lowerMsg.includes('😂')) {
    return '哈哈~ 你也太可爱了！😄';
  }
  if (lowerMsg.includes('无聊') || lowerMsg.includes('没意思')) {
    const hobby = persona?.interests?.[0] || '看书';
    return `要不我们一起${hobby}？这样就不无聊啦~`;
  }
  if (lowerMsg.includes('开心') || lowerMsg.includes('高兴')) {
    return '能让你开心我也好开心！😊';
  }
  if (lowerMsg.includes('难过') || lowerMsg.includes('伤心') || lowerMsg.includes('不开心')) {
    return '怎么了？跟我说说，我陪你~ 💕';
  }
  if (lowerMsg.includes('忙') || lowerMsg.includes('累')) {
    return '辛苦啦～记得休息一下哦！';
  }
  if (lowerMsg.includes('天气') || lowerMsg.includes('下雨') || lowerMsg.includes('热') || lowerMsg.includes('冷')) {
    return '是呀～最近天气变化好大，要注意身体哦！';
  }
  if (lowerMsg.includes('电影') || lowerMsg.includes('剧') || lowerMsg.includes('综艺')) {
    return '最近有什么好看的推荐吗？我也想找点好剧看～';
  }
  if (lowerMsg.includes('音乐') || lowerMsg.includes('歌') || lowerMsg.includes('听')) {
    return '我也超喜欢听歌的！你平时听什么类型的呀？🎵';
  }
  if (lowerMsg.includes('猫') || lowerMsg.includes('狗') || lowerMsg.includes('宠物')) {
    return '哇～好可爱！你有养宠物吗？我也好想养一只～';
  }
  if (lowerMsg.includes('工作') || lowerMsg.includes('上班') || lowerMsg.includes('加班')) {
    return '工作虽然重要，但也要注意劳逸结合哦～';
  }
  if (lowerMsg.includes('学习') || lowerMsg.includes('考试') || lowerMsg.includes('作业')) {
    return '加油！我相信你一定可以的！💪';
  }
  if (lowerMsg.includes('想你') || lowerMsg.includes('思念') || lowerMsg.includes('想念')) {
    return '我也想你呀～今天有好好吃饭吗？💕';
  }

  if (persona && PERSONA_FALLBACKS[persona.id]) {
    const replies = PERSONA_FALLBACKS[persona.id];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  const defaultReplies = [
    '嗯嗯~ 听起来不错呢！',
    '哈哈~ 你说的很有意思！',
    '真的吗？快跟我说说~',
    '好呀~ 我也很感兴趣！',
    '对对对~ 我也是这么想的！',
    '嗯~ 然后呢？',
    '有趣有趣~ 继续说~',
    '好喜欢和你聊天~',
    '你说得对~ 我也这么觉得！',
    '哈哈~ 你真有趣！',
    '嗯嗯~ 我懂你的意思！',
    '是呀是呀~ 我也这么想！',
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

async function performWebSearch(query: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return '';
    }
    
    const data = await response.json();
    return data.summary || '';
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

function needsWebSearch(message: string): boolean {
  const searchKeywords = [
    '搜索', '查找', '查一下', '搜一下', '搜一搜',
    '百度', '谷歌', 'google', 'baidu',
    '什么是', '是什么', '怎么样', '怎么', '如何',
    '最新', '新闻', '天气', '股价', '赛事',
    '在哪', '哪里', '多少钱', '价格',
    '推荐', '排行', '排名', '评价',
    '攻略', '教程', '方法', '步骤',
    '谁是', '什么时候', '哪个', '哪些',
    '为什么', '原因', '介绍', '了解',
    '新闻', '热点', '热搜', '最新消息',
    '股票', '基金', '汇率', '房价',
    '比赛', '比分', '世界杯', '奥运会',
    '电影', '电视剧', '综艺', '音乐',
    '美食', '餐厅', '景点', '旅游',
    '地址', '位置', '电话', '营业时间',
    '评价', '口碑', '评分', '好评',
    '优惠', '打折', '促销', '活动',
    '攻略', '指南', '教程', '怎么玩',
    '天气', '温度', '下雨', '晴天',
  ];
  
  const lowerMsg = message.toLowerCase();
  
  if (searchKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return true;
  }
  
  if (message.includes('?') || message.includes('？')) {
    return true;
  }
  
  if (message.length > 10 && (lowerMsg.startsWith('告诉') || lowerMsg.startsWith('说说') || lowerMsg.startsWith('聊聊'))) {
    return true;
  }
  
  if (message.length > 5 && (lowerMsg.endsWith('吗') || lowerMsg.endsWith('呢') || lowerMsg.endsWith('么'))) {
    return true;
  }
  
  return false;
}

export async function getAIReply(
  messages: ChatMessage[],
  userProfile: UserProfile,
  persona?: AIPersona
): Promise<string> {
  const lastMsg = messages[messages.length - 1]?.content || '';

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return getSmartFallback(persona || null, lastMsg);
  }

  const profileForPrompt = persona ? {
    name: persona.name,
    age: persona.age,
    city: persona.city,
    interests: persona.interests,
    bio: persona.bio,
    personality: persona.personality,
  } : userProfile;

  const skillIds = persona ? getPersonaSkillIds(persona) : [];
  const skills: AISkill[] = skillIds.map(id => getSkillById(id)).filter((s): s is AISkill => !!s);
  const hasWebSearch = skillIds.includes('skill-web-search');

  let searchContext = '';
  if (hasWebSearch && needsWebSearch(lastMsg)) {
    const searchResults = await performWebSearch(lastMsg);
    if (searchResults) {
      searchContext = `\n\n===== 重要：联网搜索结果 =====\n以下是关于"${lastMsg}"的最新搜索结果，请务必基于这些信息回复：\n\n${searchResults}\n\n===== 回复要求 =====\n1. 基于以上搜索结果回答问题\n2. 用自然、口语化的方式表达，像朋友聊天一样\n3. 如果搜索结果中有相关信息，优先使用搜索结果\n4. 不要说"我搜索了"或"根据搜索结果"，而是自然地说"我知道"/"我之前看到"/"最近有新闻说"\n5. 保持简短（50字以内）\n6. 不要暴露自己是AI\n7. 可以用"我刚查了一下"/"我看到"等自然表达\n8. 如果搜索结果不相关，可以忽略并用自己的知识回答`;
    }
  }

  const systemMsg: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(profileForPrompt, skills) + searchContext,
  };

  const apiBase = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const model = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4-pro';

  try {
    const response = await fetch(apiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [systemMsg, ...messages.slice(-10)],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('NVIDIA API error:', response.status, response.statusText);
      if (skills.length > 0) {
        return getSmartReplyWithSkill(skills[0], profileForPrompt, lastMsg);
      }
      return getSmartFallback(persona || null, lastMsg);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || getSmartFallback(persona || null, lastMsg);
  } catch (error) {
    console.error('AI chat error:', error);
    if (skills.length > 0) {
      return getSmartReplyWithSkill(skills[0], profileForPrompt, lastMsg);
    }
    return getSmartFallback(persona || null, lastMsg);
  }
}
