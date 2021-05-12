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

const cssWithoutCustomProps = `.danger {
  color: hsla(292, 56%, 33%, 1);
  font-size: 1.2rem;
}`;

const cssWithUndefinedCustomProp = `.success {
  color: var(--color-green, #00FFAA);
  border-radius: var(--border-radius, 4px)
}`;

const properties = {
  "--border-radius": "4px",
  "--color-red": "#FF0000",
  "--custom-border":
    "var(--border-radius, 4px) solid var(--color-red, #FF0000)",
};

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

const resultantCSS = `.danger {
  --danger-radius: var(--border-radius, 4px);
  border-radius: var(--danger-radius);
}
.success {
  border: var(--custom-border, var(--border-radius, 4px) solid var(--color-red, #FF0000));
}
.info {
  color: var(--color-red, #FF0000);
}`;

module.exports = {
  css,
  cssWithUndefinedCustomProp,
  cssWithoutCustomProps,
  resultantCSS,
  wrongProps,
  properties,
};
