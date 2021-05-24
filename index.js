const { writeFile } = require("fs");

const { getCustomProp, noop } = require("./helper");

module.exports = validateCustomProps;
module.exports.postcss = true;

/**
 * Object to define an incorrect CSS custom property
 *
 * @typedef {Object} WrongProp
 * @property {string} path - absolute path of the CSS file
 * @property {number} line - line number containing the custom property
 * @property {string} key - key of the custom property
 * @property {string} current - current value of the custom property
 * @property {string} expected - expected correct value of the custom property
 */

/**
 * Callback to handle the response of the plugin
 *
 * @callback requestCallback
 * @param {Object} error - an error object
 * @param {WrongProp[]} data - a list of incorrect custom properties
 * @returns
 */

/**
 * Postcss plugin to validate fallback value of CSS custom properties
 *
 * @param {Object} opts - plugin options
 * @param {Object} opts.properties - CSS custom properties to validate values from
 * @param {boolean} opts.write [write=false] - update the file with updated CSS
 * @param {requestCallback} opts.callback [callback=() => {}] - callback to handle the response
 * @returns Object
 */
function validateCustomProps({ properties, write = false, callback = noop }) {
  if (!properties) {
    throw new Error("No properties present in options");
  }

  return {
    postcssPlugin: "postcss-customprop-validate",
    prepare(result) {
      const wrongProps = [];

      return {
        Declaration(decl) {
          const customProp = getCustomProp(decl);

          // only process custom properties
          if (!customProp) return;

          const { key, value } = customProp;
          const expected = properties[key];

          // only process if the custom property is defined in `properties` plugin option
          if (!expected) return;

          // only process if the fallback value is incorrect
          if (value === expected) return;

          wrongProps.push({
            path: decl.source.input.file,
            line: decl.source.start.line,
            key,
            current: value,
            expected,
          });

          decl.replaceWith({
            prop: decl.prop,
            raws: decl.raws,
            value: `var(${key}, ${expected})`,
          });
        },
        OnceExit(root) {
          result.wrongProps = wrongProps;

          const resultant = root.toResult().css;
          const { file } = root.source.input;

          if (write && wrongProps.length) {
            writeFile(file, resultant, (err) => callback(err, wrongProps));
          } else {
            callback(null, wrongProps);
          }
        },
      };
    },
  };
}
