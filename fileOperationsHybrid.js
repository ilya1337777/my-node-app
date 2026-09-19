const fs = require('fs');
const path = require('path');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);

class FileManagerHybrid {
  constructor(baseDir = './data-hybrid') {
    this.baseDir = baseDir;
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`Создана директория: ${baseDir}`);
    }
  }

  _resolve(promise, callback) {
    if (typeof callback === 'function') {
      promise
        .then((data) => callback(null, data))
        .catch((err) => callback(err, null));
      return undefined;
    }
    return promise;
  }

  createFile(filename, content, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = writeFileAsync(filePath, content, 'utf8').then(() => filePath);
    return this._resolve(promise, callback);
  }

  readFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = readFileAsync(filePath, 'utf8');
    return this._resolve(promise, callback);
  }

  getFileStats(filename, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = statAsync(filePath).then((stats) => ({
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
    }));
    return this._resolve(promise, callback);
  }

  deleteFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = unlinkAsync(filePath).then(() => undefined);
    return this._resolve(promise, callback);
  }

  listFiles(callback) {
    const promise = readdirAsync(this.baseDir).then(async (files) => {
      const stats = await Promise.all(
        files.map(async (file) => {
          const s = await statAsync(path.join(this.baseDir, file));
          return { name: file, isFile: s.isFile() };
        })
      );
      return stats.filter((s) => s.isFile).map((s) => s.name);
    });
    return this._resolve(promise, callback);
  }
}

module.exports = FileManagerHybrid;
