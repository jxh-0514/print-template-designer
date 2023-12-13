/*
 * @Descripttion:
 * @version:
 * @Author: 杭
 * @Date: 2023-12-13 14:01:42
 * @LastEditors: 杭
 * @LastEditTime: 2023-12-13 22:55:40
 */
// module.exports = {
//   root: false,
//   env: {
//     node: true
//   },
//   extends: ['plugin:vue/essential', 'eslint:recommended', 'plugin:prettier/recommended'],
//   parserOptions: {
//     parser: '@babel/eslint-parser'
//   },
//   rules: {
//     'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
//     'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
//   }
// }
// 关闭eslint校验
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'plugin:vue/essential',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020, // 支持 ES2020 语法
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true // 支持 JSX
    }
  },
  plugins: ['vue'],
  rules: {
    'generator-star-spacing': 'off',
    'no-tabs': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-irregular-whitespace': 'off',
    'no-debugger': 'off'
  }
}
