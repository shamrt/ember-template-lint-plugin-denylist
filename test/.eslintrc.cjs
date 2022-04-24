module.exports = {
  extends: ['../.eslintrc.cjs', 'plugin:jest/all'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'jest/require-hook': 'off',
  },
};
