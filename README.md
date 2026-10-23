# React + TypeScript + Vite

## Supabase Auth Setup

Apply the migrations in order with `supabase db push`. The onboarding migration expects the existing `stores` and `store_settings` tables; it creates profiles for new users and initializes a store and store settings in the same database transaction. Account deletion archives the store and preserves order/product history.

In Supabase Auth settings:

- Configure the signup email template to display `{{ .Token }}` so users receive the six-digit code used by `/signup`.
- Set an appropriate short OTP expiry and add the deployed app URL plus `/reset-password` and `/dashboard/settings` to the redirect URL allowlist.
- Enable Google and configure its provider callback URL in the provider console. Disable GitHub as an auth provider in Supabase if it was previously enabled.
- Configure Supabase Auth's server-side rate limits and password-strength requirements for the project. The application's in-memory rate limiter is only a user-interface safeguard and can be bypassed; it is not a security boundary.
- Enable secure email changes to require confirmation at both the old and new email addresses.
- Enable TOTP MFA if users should be able to activate authenticator-app verification from Security settings.

Deploy account deletion with `supabase functions deploy delete-account`. Configure the Edge Function secrets `RESEND_API_KEY` and `ACCOUNT_DELETION_FROM_EMAIL` to send the farewell email. The function also requires the standard Supabase URL, anon key, and service-role key available to Edge Functions. Without the mail secrets, deletion still succeeds but the response reports that no farewell email was sent.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
