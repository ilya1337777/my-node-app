const { execFileSync } = require('child_process');
const path = require('path');
const bin = path.resolve(__dirname, '../../bin/index.js');

function run(args) {
  try {
    const out = execFileSync('node', [bin, ...args], { encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: e.stdout, err: e.stderr };
  }
}

test('--version', () => {
  const { out } = run(['--version']);
  expect(out.trim()).toBe('1.0.0');
});

test('unknown command -> code 1', () => {
  const { code } = run(['unknown']);
  expect(code).toBe(1);
});

test('build --dry-run не меняет файлы', () => {
  const { out } = run(['build', '--dry-run']);
  expect(out).toMatch(/DRY-RUN/);
});
