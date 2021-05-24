# PostCSS Customprop Validate [![Build](https://img.shields.io/github/workflow/status/gojek/postcss-customprop-validate/Test)](https://github.com/gojek/postcss-customprop-validate/actions/workflows/test.yml)

[PostCSS] plugin to validate [fallback values] of CSS custom properties.

Validating the fallback values of CSS custom properties manually can be error prone and challening, specially if there are many.

This plugin validates the CSS and returns custom properties with incorrect fallback values. It can also modify the source CSS file with the updated values.

## Usage

```js
const postcss = require("postcss");
const plugin = require("postcss-customprop-validate");
const { readFileSync } = require("fs");

const cssPath = "./sample.css";
const css = readFileSync(cssPath, "utf-8");
/*
{
  font-size: 1rem;
  color: var(--color-red, #fa0000);
}
*/

const properties = {
  "--color-red": "#ff0000",
};

const callback = (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
};

postcss([
  plugin({
    properties,
    write: false,
    callback,
  }),
])
  .process(css, { from: cssPath })
  .then((result) => {
    console.log(result.wrongProps);
    /*
     [
       {
         path: "./sample.js",
         line: 3,
         key: "--color-red",
         current: "#fa0000",
         expected: "#ff0000"
       }
     ]
    */
  });
```

See [PostCSS] docs for examples for your environment.

## Options

The plugin accepts an object containing 3 properties:

### **`properties`**

Required: `true`

An object containg key and expected fallback values of custom properties. The plugin uses it as the source of truth to validate the CSS.

Example:

```json
{
  "--border-radius": "4px",
  "--color-red": "#ff0000",
  "--danger-border":
    "var(--border-radius, 4px) solid var(--color-red, #ff0000)",
};
```

### **`write`**

Default: `false`

Modifies the source CSS file with the correct fallback values.

#### Formatting

The plugin does not preserves the code formatting. If you use a code formatter like [prettier], you may need to re-run it after the plugin modifies the source file.

### **`callback`**

Default: `() => {}`

Callback to handle the output of the plugin. The plugin invokes the callback after it processes the CSS of each file. The callback accepts 2 arguments. The first argument is an error object. The second argument is an array of objects. Each object represents an incorrect fallback value having the following shape:

- `path` - absolute path of the CSS file
- `line` - line number containing the custom property
- `key` - key of the custom property
- `current` - current fallback value
- `expected` - expected fallback value

The second argument is also available in the plugin's result as `result.wrongProps`

## Example

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

Custom properties with incorrect fallback values:

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

[postcss]: https://github.com/postcss/postcss
[fallback values]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties#custom_property_fallback_values
[prettier]: https://github.com/prettier/prettier
[options]: #options
[response]: #response
[official docs]: https://github.com/postcss/postcss#usage
