const postcss = require("postcss");

jest.mock("fs");
const fs = require("fs");

const plugin = require("../index");
const {
  css,
  cssWithUndefinedCustomProp,
  cssWithoutCustomProps,
  properties,
  wrongProps,
  resultantCSS,
} = require("../values");

async function run(input, opts = {}) {
  return await postcss([plugin(opts)]).process(input, {
    from: undefined,
  });
}

describe("postcss-validate-customprop", () => {
  afterAll(() => {
    jest.unmock("fs");
  });

  test("validates CSS", async () => {
    const callback = jest.fn();
    const result = await run(css, { properties, callback });

    expect(result.wrongProps).toEqual(wrongProps);
    expect(callback).toHaveBeenCalled();

    const resultWithoutCustomProps = await run(cssWithoutCustomProps, {
      properties,
    });
    expect(resultWithoutCustomProps.wrongProps).toEqual([]);

    const resultWithUndefinedCustomProps = await run(
      cssWithUndefinedCustomProp,
      {
        properties,
      }
    );
    expect(resultWithUndefinedCustomProps.wrongProps).toEqual([]);
  });

  test("throws error on missing options", async () => {
    expect(() =>
      postcss([plugin({})]).process(css, {
        from: undefined,
      })
    ).toThrow();
  });

  test("modifies file with correct CSS", async () => {
    const result = await run(css, { properties, write: true });
    expect(fs.writeFile).toHaveBeenCalled();
    expect(result.css).toEqual(resultantCSS);
  });
});
