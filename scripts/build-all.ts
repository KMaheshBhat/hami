import { rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The order of this array defines the build sequence.
 * Add new packages here to include them in the 'all:build' process.
 */
const BUILD_ORDER = [
  ['@hami-frameworx/core'],
  [
    '@hami-frameworx/core-config-fs',
    '@hami-frameworx/core-fs',
    '@hami-frameworx/core-trace-fs',
  ],
  ['@hami-frameworx/hami-cli'],
];

function hasTestScript(pkgName: string): boolean {
  const folderName = pkgName.split('/').pop() || '';
  const paths = [
    join('packages', folderName, 'package.json'),
    join('apps', folderName, 'package.json')
  ];
  for (const pkgJsonPath of paths) {
    if (existsSync(pkgJsonPath)) {
      try {
        const content = readFileSync(pkgJsonPath, 'utf8');
        const pkgJson = JSON.parse(content);
        return !!(pkgJson.scripts && pkgJson.scripts.test);
      } catch (e) {
        continue;
      }
    }
  }
  return false;
}

async function runBuilds() {
  const startTime = performance.now();
  const args = Bun.argv;
  const shouldClean = args.includes('--clean');
  const shouldPackage = args.includes('--dist');
  const shouldTest = args.includes('--test');

  if (shouldClean) {
    console.log('🧹 Flag --clean detected. Wiping dist folders...');
    const glob = new Bun.Glob('**/{dist,tsconfig.tsbuildinfo}');
    for (const file of glob.scanSync({ cwd: '.', absolute: true, onlyFiles: false })) {
      if (file.includes('/apps/') || file.includes('/packages/')) {
        rmSync(file, { recursive: true, force: true });
      }
    }
  }

  console.log('\n🛠️ Starting Monorepo Build Sequence...\n');

  for (const group of BUILD_ORDER) {
    console.log(`📦 Building group: ${group.join(', ')}`);

    // 1. Build Phase
    const buildArgs = ['bun', 'run'];
    for (const pkg of group) buildArgs.push('--filter', pkg);
    buildArgs.push('build');

    const buildProc = Bun.spawn(buildArgs, { stdout: 'inherit', stderr: 'inherit' });
    if ((await buildProc.exited) !== 0) {
      console.error(`\n❌ Build failed for group: ${group.join(', ')}`);
      process.exit(1);
    }

    // 2. Conditional Test Phase
    if (shouldTest) {
      for (const pkg of group) {
        if (hasTestScript(pkg)) {
          console.log(`🧪 Running tests for: ${pkg}`);
          const testProc = Bun.spawn(['bun', 'run', '--filter', pkg, 'test'], {
            stdout: 'inherit',
            stderr: 'inherit',
          });

          if ((await testProc.exited) !== 0) {
            console.error(`\n❌ Tests failed for ${pkg}. Aborting sequence.`);
            process.exit(1);
          }
        } else {
          console.log(`⏩ Skipping tests for ${pkg} (No test script found)`);
        }
      }
    }
    console.log(`✅ Group completed: ${group.join(', ')}\n`);
  }

  // 3. Binary Compilation
  if (shouldPackage) {
    console.log('🚀 All packages built. Starting binary compilation...');
    const exePath = 'apps/hami-cli/dist/hami';
    const compileProc = Bun.spawn(['bun', 'build', 'apps/hami-cli/src/index.ts', '--compile', '--outfile', exePath], {
      stdout: 'inherit', 
      stderr: 'inherit' 
    });

    if ((await compileProc.exited) !== 0) {
      console.error('\n❌ Binary compilation failed.');
      process.exit(1);
    }
    console.log(`💎 Standalone binary ready at: ${exePath}`);
  }

  const duration = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`✨ All builds finished successfully in ${duration}s!`);
}

runBuilds();
