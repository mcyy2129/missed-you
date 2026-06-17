const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://postgres.zhepowyiiyflfytklouz:D8pm6BJQ1kABbnA8@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

function generateUserCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  const email = process.argv[2] || 'admin@missed.com';
  const password = process.argv[3] || 'admin123456';
  const name = process.argv[4] || '管理员';

  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      console.log(`用户 ${email} 已存在，更新为管理员...`);
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
      console.log(`已将 ${email} 设置为管理员`);
    } else {
      const id = uuidv4();
      const userCode = generateUserCode();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const now = Date.now();

      await pool.query(
        `INSERT INTO users (id, user_code, email, password, plain_password, name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, userCode, email, hashedPassword, password, name, 'admin', now, now]
      );
      console.log(`管理员账号创建成功:`);
      console.log(`  邮箱: ${email}`);
      console.log(`  密码: ${password}`);
      console.log(`  邀请码: ${userCode}`);
    }

    await pool.end();
  } catch (e) {
    console.error('出错了：', e.message);
    await pool.end();
    process.exit(1);
  }
}
main();
