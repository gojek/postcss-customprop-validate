# PostCSS Customprop Validate

[PostCSS] plugin to validate fallback values of CSS custom properties.

Validating the fallback values of CSS custom properties manually can be error prone and challening if they are huge in number. This plugin removes this effort altogether.

The plugin accepts an object containing custom properties in plugin [options]. Using it as the source of truth, the plugin validates the CSS and finds out the custom properties with incorrect fallback values.

The plugin can also modify the source file with the updated CSS -- with correct fallback values. See `write` under [options]

> If you use a code formatter like [prettier], you may need to re-run it after the plugin modifies the source file.

## Options

The plugin accepts 3 options:

**`properties`**

An object containg key and fallback values of custom properties

| type   | required | default |
| ------ | -------- | ------- |
| Object | true     | N/A     |

**`write`**

Writes the source CSS file with the updated CSS

| type    | required | default |
| ------- | -------- | ------- |
| boolean | false    | false   |

**`callback`**

Callback to handle the response of the plugin. The callback accepts 2 arguments:

- error: an error object
- data: the response

| type     | required | default  |
| -------- | -------- | -------- |
| Function | false    | () => {} |

## Response

The response is a list of object of custom properties with incorrect fallback values. The plugin's result also contains the response -- `result.wrongProps`. Shape of the object:

- `path` {string} - absolute path of the CSS file
- `line` {number} - line number containing the custom property
- `key` {string} - key of the custom property
- `current` {string} - current fallback value
- `expexted` {string} - expected fallback value

## Example

Sample `properties` option:

```json
{
  "--border-radius": "4px",
  "--color-red": "#ff0000",
  "--danger-border":
    "var(--border-radius, 4px) solid var(--color-red, #ff0000)",
};
```

A sample CSS:

```css
.foo {
  border: var(
    --danger-border,
    var(--border-radius, 5px) solid var(--color-red, #fa0000)
  );
}

.bar {
  --danger-text: var(--color-red, red);
  color: var(--danger-text);
}
```

The resultant CSS that the plugin produces:

```diff
.foo {
  border: var(
    --danger-border,
-    var(--border-radius, 5px) solid var(--color-red, #fa0000)
+    var(--border-radius, 4px) solid var(--color-red, #ff0000)
  );
}

.bar {
-  --danger-text: var(--color-red, red);
+  --danger-text: var(--color-red, #ff0000);
  color: var(--danger-text);
}
```

List of the incorrect custom properties ([response]).

```js
[
  {
    path: undefined,
    line: 2,
    key: "--danger-border",
    current: "var(--border-radius, 5px) solid var(--color-red, #fa0000)",
    expected: "var(--border-radius, 4px) solid var(--color-red, #ff0000)",
  },
  {
    path: undefined,
    line: 9,
    key: "--color-red",
    current: "red",
    expected: "#ff0000",
  },
];
```

## Usage

### Add to plugins list

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-customprop-validate
```

**Step 2:** Check you project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
+const properties = {
+ "--color-red": "#ff0000",
+}

module.exports = {
  plugins: [
+    require('postcss-customprop-validate')({ properties })
     require("autoprefixer")
  ]
}

```

### Programmatic

```js
const { readFileSync } = require("fs");
const postcss = require("postcss");

const plugin = require("./index");
const path = require("path");

const cssPath = path.resolve("./sample.css");

const css = readFileSync(cssPath, "utf-8");
const properties = {
  /* key and fallback values of custom properties */
};

postcss([plugin({ properties })])
  .process(css, { from: cssPath })
  .then((result) => {
    console.log(result.css);
    console.log(result.wrongProps);
    /* handle the result */
  });
```

[postcss]: https://github.com/postcss/postcss
[prettier]: https://github.com/prettier/prettier
[options]: #options
[response]: #response
[official docs]: https://github.com/postcss/postcss#usage
