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
 * @property {string} expexted - expected correct value of the custom property
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

          // exit if the declaration is not a custom property
          if (!customProp) return;

          const { key, value } = customProp;
          const expected = properties[key];

          // exit if a custom property does not exist in `properties` plugin options
          if (!expected) return;

          // exit if the fallback value of the custom property is correct
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
          const resultant = root.toResult().css;
          const { file } = root.source.input;

          if (write && wrongProps.length) {
            writeFile(file, resultant, (err) => callback(err, wrongProps));
          } else {
            callback(null, wrongProps);
          }

          result.wrongProps = wrongProps;
        },
      };
    },
  };
}
