const { toPlainObject, parse } = require("css-tree");

/**
 * Checks if a node is of type `Function`
 *
 * @param {Object} node node of AST
 * @param {string} node.type
 * @returns {boolean}
 */
const isFunction = ({ type }) => type === "Function";

/**
 * Checks if a node is of type `Identifier`
 *
 * @param {Object} node node of AST
 * @param {string} node.type
 * @returns {boolean}
 */
const isIdentifier = ({ type }) => type === "Identifier";

/**
 * Checks if a node is of type `Raw`
 *
 * @param {Object} node node of AST
 * @param {string} node.type
 * @returns {boolean}
 */
const isRaw = ({ type }) => type === "Raw";

/**
 * Removes newlines and extra spaces from a string
 *
 * @param {string} str
 * @returns {string}
 */
const getSingleLineValue = (str) =>
  str
    .replace(/(\r|\n)?\n/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

/**
 * Checks if the declaration's value contains a CSS custom property
 *
 * the custom properties are available as children of the 1st element of `tree` argument
 * and type of the object is `Function`
 *
 * @param {Object[]} tree AST transformed into a plain object
 * @returns {boolean}
 */
const hasCustomProp = (tree) => tree[0].children && !!tree.find(isFunction);

const noop = () => {};

/**
 * @typedef CustomProp
 * @property {string} key - key of the custom property
 * @property {string} value - value of the custom property
 */
/**
 * Validates if a Declaration node has a CSS custom property
 * If yes, returns its key and value
 * Else, returns `undefined`
 *
 * @param {Object} declaration declaration node
 * @returns {(CustomProp|undefined)}
 */
const getCustomProp = (declaration) => {
  const astObject = toPlainObject(
    parse(declaration.value, { context: "value" })
  ).children;

  if (!hasCustomProp(astObject)) return;

  const { children } = astObject[0];
  const identifier = children.find(isIdentifier);

  if (!identifier) return;

  const { name } = identifier;
  const raw = children.find(isRaw);
  const value = raw && getSingleLineValue(raw.value);

  return { key: name, value };
};

module.exports = {
  noop,
  getCustomProp,
};
