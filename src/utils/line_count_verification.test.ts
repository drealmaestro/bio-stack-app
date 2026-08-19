import { describe, it, expect } from 'vitest';

describe('Line count compliance audit', () => {
  it('should ensure all files in src/ have 350 lines or fewer', () => {
    const files = import.meta.glob<string>('../**/*', {
      query: '?raw',
      import: 'default',
      eager: true,
    });

    expect(Object.keys(files).length).toBeGreaterThan(0);

    const violatingFiles: { file: string; lines: number }[] = [];

    Object.entries(files).forEach(([filePath, content]) => {
      const lineCount = content.split('\n').length;
      if (lineCount > 350) {
        violatingFiles.push({
          file: filePath,
          lines: lineCount,
        });
      }
    });

    if (violatingFiles.length > 0) {
      console.error('Violating files (> 350 lines):', violatingFiles);
    }

    expect(violatingFiles).toEqual([]);
  });

  it('should ensure all components in src/components and src/pages have 250 lines or fewer', () => {
    const files = import.meta.glob<string>(['../components/**/*', '../pages/**/*'], {
      query: '?raw',
      import: 'default',
      eager: true,
    });

    const violatingComponents: { file: string; lines: number }[] = [];

    Object.entries(files).forEach(([filePath, content]) => {
      // Exclude test files from component modularity check
      if (filePath.includes('.test.')) return;
      const lineCount = content.split('\n').length;
      if (lineCount > 250) {
        violatingComponents.push({
          file: filePath,
          lines: lineCount,
        });
      }
    });

    if (violatingComponents.length > 0) {
      console.error('Violating components (> 250 lines):', violatingComponents);
    }

    expect(violatingComponents).toEqual([]);
  });
});

