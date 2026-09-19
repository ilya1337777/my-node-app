const { UserTracker } = require('./userTracker');

const tracker = new UserTracker();

tracker.on('user:action', ({ userId, action, timestamp, metadata, id }) => {
  console.log(`👤 Пользователь ${userId} совершил действие "${action}"`);
  console.log(`   Время: ${timestamp}`);
  console.log(`   ID события: ${id}`);
  console.log(`   Доп. данные: ${JSON.stringify(metadata)}`);
  console.log('');
});

tracker.trackAction(1, 'login', { ip: '192.168.1.10', browser: 'Chrome' });
tracker.trackAction(42, 'purchase', { orderId: 1001, amount: 756, currency: 'RUB' });
tracker.trackAction('user-abc', 'logout', { reason: 'timeout' });
tracker.trackAction(7, 'profile_update', { fields: ['email', 'phone'], changed: 2 });
