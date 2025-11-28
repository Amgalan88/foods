// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  // Next.js зөвлөмжүүд (Core Web Vitals)
  ...nextVitals,

  // Төслийн ерөнхий дүрэм
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier-ийг error болгож, format-аа хатуу барина
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          endOfLine: 'auto',
        },
      ],
      // Ашиглаагүй хувьсагчийг warning болгож өгөв
      'no-unused-vars': 'warn',
      // Next 13+ дээр хэрэггүй
      'react/react-in-jsx-scope': 'off',
    },
  },

  // ESLint-ийг Prettier-тэй зөрчилдөхөөс хамгаална
  prettierConfig,

  // Барих хэрэггүй хавтаснуудад lint хийхгүй
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
]);
