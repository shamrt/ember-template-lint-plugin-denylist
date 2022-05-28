import validatePeerDependencies from 'validate-peer-dependencies';

import denylist from './rules/denylist';

// eslint-disable-next-line unicorn/prefer-module
validatePeerDependencies(__dirname);

export const name = 'ember-template-lint-plugin-denylist';

export const rules = { denylist };

export default { name, rules };
