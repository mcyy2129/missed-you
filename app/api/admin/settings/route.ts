import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

async function ensureSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      settings JSONB NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `);
}

async function loadSettings(): Promise<SiteSettings> {
  try {
    await ensureSettingsTable();
    const { rows } = await pool.query('SELECT settings FROM site_settings WHERE id = $1', ['default']);
    if (rows[0]) {
      return typeof rows[0].settings === 'string' ? JSON.parse(rows[0].settings) : rows[0].settings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

async function saveSettings(settings: SiteSettings): Promise<void> {
  await ensureSettingsTable();
  const now = Date.now();
  await pool.query(`
    INSERT INTO site_settings (id, settings, updated_at) VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET settings = $2, updated_at = $3
  `, ['default', JSON.stringify(settings), now]);
}

export async function GET(req: NextRequest) {
  try {
    const settings = await loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const newSettings = await req.json();
    await saveSettings(newSettings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: '保存设置失败' }, { status: 500 });
  }
}
