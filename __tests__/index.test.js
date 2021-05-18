const postcss = require("postcss");

jest.mock("fs", () => {
  return {
    writeFile: jest
      .fn()
      .mockImplementation((file, path, cb) => cb("foo"))
      .mockName("nodeWriteFile"),
  };
});

const plugin = require("../index");

async function run(input, opts = {}) {
  return await postcss([plugin(opts)]).process(input, {
    from: undefined,
  });
}

describe("postcss-validate-customprop", () => {
  test("validates CSS", async () => {
    const properties = {
      "--border-radius": "4px",
      "--color-red": "#FF0000",
      "--custom-border":
        "var(--border-radius, 4px) solid var(--color-red, #FF0000)",
    };

    const css = `.danger {
      --danger-radius: var(--border-radius, 4px);
      border-radius: var(--danger-radius);
    }
    .success {
      border: var(--custom-border, var(--border-radius, 5px) solid var(--color-red, #FA0000));
    }
    .info {
      color: var(--color-red, red);
    }`;

    const wrongProps = [
      {
        path: undefined,
        line: 6,
        key: "--custom-border",
        current: "var(--border-radius, 5px) solid var(--color-red, #FA0000)",
        expected: "var(--border-radius, 4px) solid var(--color-red, #FF0000)",
      },
      {
        path: undefined,
        line: 9,
        key: "--color-red",
        current: "red",
        expected: "#FF0000",
      },
    ];

    const callback = jest.fn();

    const result = await run(css, { properties, callback });
    expect(result.wrongProps).toEqual(wrongProps);
    expect(callback).toHaveBeenCalledWith(null, wrongProps);

    const cssWithoutCustomProps = `.danger {
      color: hsla(292, 56%, 33%, 1);
      font-size: 1.2rem;
    }`;

    const resultWithoutCustomProps = await run(cssWithoutCustomProps, {
      properties,
    });
    expect(resultWithoutCustomProps.wrongProps).toEqual([]);

    const cssWithUnknownCustomProp = `.success {
      color: var(--color-green, #00FFAA);
      border-radius: var(--border-radius, 4px)
    }`;

    const resultWithUndefinedCustomProps = await run(cssWithUnknownCustomProp, {
      properties,
    });
    expect(resultWithUndefinedCustomProps.wrongProps).toEqual([]);
  });

  test("throws error on missing options", async () => {
    const css = `.danger {
      border-radius: var(--border-radius, 5px);
    }`;

    expect(() =>
      postcss([plugin({})]).process(css, {
        from: undefined,
      })
    ).toThrow();
  });

  test("modifies file with correct CSS", async () => {
    const fs = require("fs");
    const callback = jest.fn();

    const properties = {
      "--border-radius": "4px",
    };

    const css = `.danger {
      border-radius: var(--border-radius, 5px);
    }`;

    const wrongProps = [
      {
        path: undefined,
        line: 2,
        key: "--border-radius",
        current: "5px",
        expected: "4px",
      },
    ];

    await run(css, { properties, write: true, callback });

    expect(fs.writeFile).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith("foo", wrongProps);
  });
});
