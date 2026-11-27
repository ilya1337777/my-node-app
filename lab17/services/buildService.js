const fs = require('fs');

function build({ configPath = 'config.json' } = {}) {
  if (!fs.existsSync(configPath)) {
    const err = new Error('файл ' + configPath + ' не найден');
    err.code = 'CONFIG_NOT_FOUND';
    throw err;
  }
  return { output: 'dist/my-app.js', time: '2.3s' };
}
module.exports = { build };