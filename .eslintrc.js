/*
 * @Descripttion:
 * @version:
 * @Author: 杭
 * @Date: 2023-12-13 14:01:42
 * @LastEditors: 杭
 * @LastEditTime: 2023-12-13 17:48:46
 */
module.exports = {
  root: false,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
