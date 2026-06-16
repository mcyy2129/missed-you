import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/sqlite';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    logo: string;
    favicon: string;
    maintenanceMode: boolean;
  };
  matching: {
    algorithm: 'interest' | 'location' | 'random' | 'hybrid';
    maxDistance: number;
    ageRangeMin: number;
    ageRangeMax: number;
    matchCooldown: number;
  };
  ai: {
    enabled: boolean;
    responseDelay: number;
    personality: string;
    maxDailyMessages: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    matchNotification: boolean;
    messageNotification: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowProfileIndexing: boolean;
    dataRetentionDays: number;
  };
}

const defaultSettings: SiteSettings = {
  general: {
    siteName: 'Missed You',
    siteDescription: '真诚交友，不再错过',
    logo: '',
    favicon: '',
    maintenanceMode: false,
  },
  matching: {
    algorithm: 'hybrid',
    maxDistance: 100,
    ageRangeMin: 18,
    ageRangeMax: 60,
    matchCooldown: 24,
  },
  ai: {
    enabled: true,
    responseDelay: 2,
    personality: 'friendly',
    maxDailyMessages: 50,
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    matchNotification: true,
    messageNotification: true,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    allowProfileIndexing: false,
    dataRetentionDays: 365,
  },
};

function loadSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

function saveSettings(settings: SiteSettings): void {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET(req: NextRequest) {
  try {
    const settings = loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const newSettings = await req.json();
    saveSettings(newSettings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: '保存设置失败' }, { status: 500 });
  }
}
