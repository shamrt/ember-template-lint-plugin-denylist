# ember-template-lint-plugin-denylist

An `ember-template-lint` plugin for setting attribute denylists.

## Usage

This plugin allows you to set a denylist for any arbitrary HTML attribute value or values.

### Configuration

You can use all the standard [ember-template-lint configuration options](https://github.com/ember-template-lint/ember-template-lint/blob/master/docs/configuration.md). For example project wide:

```js
// .template-lintrc.js
module.exports = {
  plugins: ['ember-template-lint-plugin-denylist'],
  extends: ['recommended'],
  rules: {
    denylist: [
      'error',
      {
        attributes: [
          { name: 'alt', values: 'foo' }, // forbid substring 'foo' in 'alt' attributes
          { name: 'class', values: ['^test__', 'bar'] }, // forbid class names starting with 'test__' or containing substring 'bar'
          { name: 'id', values: 'baz$' }, // forbid IDs ending starting with 'baz'
          { name: 'class', values: '$quox$' } // forbid class names exactly matching 'quox'
        ]
      }
    ]
  }
};
```

### Configuration options

#### attributes

- array -- An array of objects with the following properties:
  - name -- string: HTML attribute to target
  - values -- string|string[]: Value or list of values to forbid
    - Special characters:
      - Prepending a value with `^` only forbids matches from the beginning of a value (e.g., `'^foo'` matches `'foobar'` but not `'barfoo'`)
      - Suffixing a value with `$` only forbids matches from the ending of a value (e.g., `'bar$'` matches `'foobar'` but not `'barbaz'`)
      - Combining both special characters forbid only exact matches (e.g., `'^foo$'` only forbids `'foo'`)

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Shane Martin](https://sha.nemart.in) and [contributors](https://github.com/shamrt/ember-template-lint-plugin-denylist/graphs/contributors).

MIT License, see the included [LICENSE](LICENSE) file.
