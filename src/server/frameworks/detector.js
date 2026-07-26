const fs = require('fs');
const path = require('path');

async function detectFramework(projectPath) {
  const detectors = [detectReact, detectVue, detectSvelte, detectHTML];

  for (const detector of detectors) {
    const result = await detector(projectPath);
    if (result) {
      return result;
    }
  }

  return {
    name: 'Unknown',
    type: 'unknown',
    configFiles: [],
    extensions: []
  };
}

async function detectReact(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.react || deps['react-dom']) {
      const hasNext = deps.next;
      const isVite = deps.vite;

      return {
        name: hasNext ? 'Next.js' : (isVite ? 'React (Vite)' : 'React'),
        type: 'react',
        configFiles: [
          'next.config.js',
          'next.config.mjs',
          'vite.config.js',
          'vite.config.ts',
          'vite.config.mjs',
          'tsconfig.json'
        ].filter(f => fs.existsSync(path.join(projectPath, f))),
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        packageManager: detectPackageManager(projectPath)
      };
    }
  }

  const viteConfig = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs']
    .find(f => fs.existsSync(path.join(projectPath, f)));

  if (viteConfig) {
    return {
      name: 'Vite',
      type: 'vite',
      configFiles: [viteConfig],
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte']
    };
  }

  return null;
}

async function detectVue(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.vue || deps['@vue/cli-service']) {
      const isNuxt = deps.nuxt || deps['@nuxt/kit'];

      return {
        name: isNuxt ? 'Nuxt' : 'Vue',
        type: 'vue',
        configFiles: [
          'nuxt.config.js',
          'nuxt.config.ts',
          'vue.config.js',
          'vue.config.ts',
          'vite.config.js',
          'vite.config.ts'
        ].filter(f => fs.existsSync(path.join(projectPath, f))),
        extensions: ['.vue', '.js', '.ts']
      };
    }
  }

  const vueConfig = ['vue.config.js', 'vue.config.ts']
    .find(f => fs.existsSync(path.join(projectPath, f)));

  if (vueConfig) {
    return {
      name: 'Vue',
      type: 'vue',
      configFiles: [vueConfig],
      extensions: ['.vue', '.js', '.ts']
    };
  }

  return null;
}

async function detectSvelte(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.svelte || deps['@sveltejs/kit']) {
      return {
        name: deps['@sveltejs/kit'] ? 'SvelteKit' : 'Svelte',
        type: 'svelte',
        configFiles: [
          'svelte.config.js',
          'svelte.config.ts',
          'vite.config.js',
          'vite.config.ts'
        ].filter(f => fs.existsSync(path.join(projectPath, f))),
        extensions: ['.svelte', '.js', '.ts']
      };
    }
  }

  return null;
}

async function detectHTML(projectPath) {
  const htmlFiles = fs.readdirSync(projectPath)
    .filter(f => f.endsWith('.html'));

  if (htmlFiles.length > 0) {
    return {
      name: 'HTML/CSS/JS',
      type: 'html',
      configFiles: [],
      extensions: ['.html', '.css', '.js'],
      htmlFiles
    };
  }

  return null;
}

function detectPackageManager(projectPath) {
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
  return 'npm';
}

module.exports = { detectFramework };
