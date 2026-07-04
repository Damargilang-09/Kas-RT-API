import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // ⚠️ WAJIB: Menghubungkan ESLint dengan TypeScript Anda
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 1. Mengingatkan variabel / import yang tidak terpakai
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_', // Abaikan parameter diawali '_' seperti (_next) di Express
        'varsIgnorePattern': '^_' 
      }],
      
      // 2. Mengingatkan unhandled async error (Floating Promises) di Express rute
      '@typescript-eslint/no-floating-promises': 'error',
    },
  }
);
