/**
 * プロジェクト基本構造のテスト
 */

import fs from 'fs';
import path from 'path';

describe('Project Setup', () => {
  test('package.json が存在し、必要な設定がある', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 基本的な設定の確認
    expect(packageJson.name).toBe('lms-line-ai-support');
    expect(packageJson.dependencies.next).toBeDefined();
    expect(packageJson.dependencies.react).toBeDefined();
    expect(packageJson.dependencies.typescript).toBeDefined();
    
    // 必要なスクリプトの確認
    expect(packageJson.scripts.dev).toBeDefined();
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.lint).toBeDefined();
    expect(packageJson.scripts['type-check']).toBeDefined();
  });

  test('TypeScript設定ファイルが存在する', () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.baseUrl).toBe('.');
    expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
  });

  test('Next.js設定ファイルが存在する', () => {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    expect(fs.existsSync(nextConfigPath)).toBe(true);
  });

  test('ESLint設定ファイルが存在する', () => {
    const eslintPath = path.join(process.cwd(), '.eslintrc.json');
    expect(fs.existsSync(eslintPath)).toBe(true);
  });

  test('基本的なディレクトリ構造が存在する', () => {
    const directories = [
      'src',
      'src/app',
      'src/components',
      'src/lib',
      'src/types',
      'src/hooks',
      'src/utils'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  test('基本的なAppファイルが存在する', () => {
    const files = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/globals.css'
    ];

    files.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});