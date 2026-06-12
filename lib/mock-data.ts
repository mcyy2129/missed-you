import { User, Message, Conversation } from './types';

export const CURRENT_USER: User = {
  id: 'current',
  name: '小明',
  age: 26,
  city: '北京',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小明',
  bio: '热爱生活，喜欢摄影和旅行。周末经常去探索城市里有趣的小店。',
  interests: ['摄影', '旅行', '咖啡', '电影'],
  photos: [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=小明1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=小明2',
  ],
};

export const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: '小红',
    age: 24,
    city: '上海',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小红',
    bio: '设计师一枚，喜欢画画和养猫。希望遇到一个有趣的灵魂。',
    interests: ['画画', '猫', '音乐', '烘焙'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小红1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小红2',
    ],
  },
  {
    id: 'user2',
    name: '小刚',
    age: 28,
    city: '深圳',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小刚',
    bio: '程序员，但不是只会敲代码的那种。喜欢健身和做饭，周末会去爬山。',
    interests: ['健身', '做饭', '爬山', '科技'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小刚1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小刚2',
    ],
  },
  {
    id: 'user3',
    name: '小芳',
    age: 25,
    city: '广州',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小芳',
    bio: '自由撰稿人，热爱阅读和写作。梦想是有一天能出版自己的小说。',
    interests: ['阅读', '写作', '旅行', '电影'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小芳1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小芳2',
    ],
  },
  {
    id: 'user4',
    name: '小龙',
    age: 30,
    city: '杭州',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小龙',
    bio: '产品经理，喜欢研究新产品和用户体验。业余时间喜欢打篮球和看球赛。',
    interests: ['篮球', '产品设计', '足球', '科技'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小龙1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小龙2',
    ],
  },
  {
    id: 'user5',
    name: '小雪',
    age: 23,
    city: '成都',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小雪',
    bio: '大学刚毕业，对未来充满期待。喜欢美食和摄影，想走遍世界各地。',
    interests: ['美食', '摄影', '旅行', '音乐'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小雪1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小雪2',
    ],
  },
  {
    id: 'user6',
    name: '大伟',
    age: 29,
    city: '南京',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=大伟',
    bio: '在一家创业公司工作，热爱挑战。周末喜欢骑行和露营。',
    interests: ['骑行', '露营', '创业', '摄影'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=大伟1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=大伟2',
    ],
  },
  {
    id: 'user7',
    name: '小丽',
    age: 27,
    city: '武汉',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小丽',
    bio: '教师，喜欢和孩子们在一起。热爱音乐和舞蹈，会弹钢琴。',
    interests: ['音乐', '舞蹈', '钢琴', '阅读'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小丽1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小丽2',
    ],
  },
  {
    id: 'user8',
    name: '小杰',
    age: 26,
    city: '西安',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小杰',
    bio: '建筑设计师，喜欢探索城市的每个角落。周末会去博物馆和美术馆。',
    interests: ['建筑', '博物馆', '美术馆', '旅行'],
    photos: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小杰1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=小杰2',
    ],
  },
];

function makeMsg(senderId: string, text: string, minutesAgo: number): Message {
  return {
    id: `msg-${senderId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    senderId,
    text,
    timestamp: Date.now() - minutesAgo * 60 * 1000,
  };
}

const conv1Messages: Message[] = [
  makeMsg('user1', '你好呀！看到你也喜欢摄影，平时都拍什么类型的照片？', 120),
  makeMsg('current', '嗨！我主要拍风景和街景，偶尔也会拍一些人像。你呢？', 110),
  makeMsg('user1', '我比较喜欢拍猫猫狗狗，还有静物。改天可以一起出去拍照呀！', 60),
  makeMsg('current', '好呀，听起来很有趣！', 30),
];

const conv2Messages: Message[] = [
  makeMsg('user2', '听说你周末喜欢去爬山？我也经常去！', 240),
  makeMsg('current', '对呀，最近去了香山，风景特别好。', 200),
  makeMsg('user2', '香山确实不错！下次可以一起去，我知道一条很棒的路线。', 180),
];

const conv3Messages: Message[] = [
  makeMsg('user3', '看到你的bio里说喜欢读书，最近在看什么书？', 480),
  makeMsg('current', '最近在看《百年孤独》，你呢？', 450),
  makeMsg('user3', '我在看《人类简史》，很有意思的一本书！', 420),
  makeMsg('current', '这本我也看过，确实很精彩。', 400),
  makeMsg('user3', '有空可以一起讨论读书心得呀！', 350),
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participants: ['current', 'user1'],
    messages: conv1Messages,
    lastMessage: conv1Messages[conv1Messages.length - 1],
  },
  {
    id: 'conv2',
    participants: ['current', 'user2'],
    messages: conv2Messages,
    lastMessage: conv2Messages[conv2Messages.length - 1],
  },
  {
    id: 'conv3',
    participants: ['current', 'user3'],
    messages: conv3Messages,
    lastMessage: conv3Messages[conv3Messages.length - 1],
  },
];
