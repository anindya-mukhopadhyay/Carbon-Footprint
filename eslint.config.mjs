import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "coverage/**",
      "services/carbon-core/target/**",
      "apps/web/public/firebase-messaging-sw.js",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/*.config.ts",
      "**/*.setup.ts",
      "cypress/**",
      "services/api/dist/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: [
          "./apps/web/tsconfig.app.json",
          "./apps/web/tsconfig.node.json",
          "./services/api/tsconfig.json"
        ],
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
      security
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...security.configs.recommended.rules,
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-misused-promises": ["error", { "checksVoidReturn": false }],
      "@typescript-eslint/restrict-template-expressions": "off",
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-empty-function": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/heading-has-content": "off",
      "@typescript-eslint/prefer-function-type": "off"
    }
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "cypress/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off"
    }
  }
);
