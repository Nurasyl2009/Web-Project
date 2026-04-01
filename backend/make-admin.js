const pool = require('./js/db');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Қате: Пайдаланушының email-ін жазыңыз. Мысалы: node make-admin.js test@example.com');
    process.exit(1);
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, name, email, role",
      [email]
    );

    if (result.rowCount === 0) {
      console.log(`Пайдаланушы табылмады: ${email}. Алдымен сайтқа тіркеліңіз.`);
    } else {
      console.log(`Құттықтаймыз! Пайдаланушы ${result.rows[0].name} (email: ${email}) енді АДМИН!`);
    }
  } catch (err) {
    console.error('Қате:', err.message);
  } finally {
    process.exit(0);
  }
}

makeAdmin();
