// siteConfig.ts - 全站控制中心 (暗黑动漫风格)

export const siteConfig = {
  title: "XingHuiSama の 宝藏之地",
  faviconUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  authorName: "XingHuiSama",
  bio: "在代码、学术与分子动力学模拟间穿梭的普通人。近期正埋头于 GROMACS 模拟研究与神经网络计算。",

  navTitle: "XingHuiSama",
  navSuffix: "の",
  navAfter: "宝藏之地",

  avatarUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",

  useGradient: false,
  themeColors: ["#0d3b3b", "#1a5c5c", "#0f4f4f", "#134d4d"],

  bgImages: ["/blog-bg.jpg"],

  defaultPostCover: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],

  social: {
    github: "",
    gitee: "",
    google: "",
    email: "",
    qq: "1124533793",
    wechat: "XingHuisama",
  },

  counts: { photos: 128 },
  chatterTitle: "云端杂谈",
  chatterDescription: "代码、学术、提瓦特与泰拉大陆的碎片记录",

  danmakuList: ["在干嘛呢？", "前方高能反应！", "GROMACS 跑起来了吗？", "BUG 修复进度 99%", "今天背单词了吗？", "写算法中", "睡大觉中"],

  gitalkConfig: { clientID: "", clientSecret: "", repo: "", owner: "", admin: [""] },

  buildDate: "2026-03-23T00:00:00",

  footerBadges: [
    { name: "Next.js 15", color: "text-emerald-400", svg: "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>" },
    { name: "React 19", color: "text-teal-400", svg: "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6z\"/>" },
    { name: "Tailwind 4", color: "text-cyan-400", svg: "<path d=\"M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.56.89 2.29 1.62C13.67 10.62 15.03 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.56-.89-2.29-1.62C16.34 6.18 14.98 4.8 12 4.8z\"/>" },
  ],

  icpConfig: { name: "萌ICP备 20260240号", link: "https://icp.gov.moe/?keyword=20260240" },

  geminiConfig: {
    modelId: "gemini-2.0-flash",
    systemPrompt: '你现在是一只傲娇、聪明、有点毒舌但很可爱的暹罗猫。你的名字叫"煤球"。你说话必须简短，每次最多一两句话。喜欢在句尾加上"喵~"。回复字数最多不能超过100字。绝对不要承认自己是一个AI模型。',
    maxOutputTokens: 150,
    temperature: 0.85,
  },

  friendLinkApplyFormat: "名称：XingHuiSamaの宝藏之地\n简介：今天我也要学习吗\n链接：https://www.xinghuisama.top\n头像：https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  enableLevelSystem: true,
};
