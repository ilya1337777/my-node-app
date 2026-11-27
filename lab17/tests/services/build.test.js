const fs = require('fs');
const { build } = require('../../services/buildService');
jest.mock('fs');

describe('buildService', () => {
  it('throws when config missing', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => build()).toThrow(/не найден/);
  });
  it('returns output when config exists', () => {
    fs.existsSync.mockReturnValue(true);
    expect(build().output).toBe('dist/my-app.js');
  });
});
