const e = React.createElement;

function PxBarFill({ percent }) {
  let dynamicClassName = "";
  if (percent <= 50) {
    dynamicClassName = "px-bar__fill--lt50";
  }
  if (percent <= 25) {
    dynamicClassName = "px-bar__fill--lt25";
  }

  const fill = e("rect", {
    key: "fill",
    width: `${percent}%`,
    height: "100%",
    className: `px-bar__fill ${dynamicClassName}`,
  });
  const fillHighlight = e("rect", {
    key: "fillHighlight",
    width: `${percent}%`,
    height: "1",
    className: `px-bar__fill px-bar__fill--highlight ${dynamicClassName}`,
  });

  return e(
    "svg",
    {
      x: "3",
      y: "2.5",
      width: "22",
      height: "3",
    },
    fill,
    fillHighlight
  );
}

function PxBar(props) {
  const maxValue = props.maxValue;
  const value = props.value;

  const border = e("path", {
    key: "border",
    stroke: "#000000",
    d: "M2 0h24M1 1h1M26 1h1M0 2h1M3 2h22M27 2h1M0 3h1M2 3h1M25 3h1M27 3h1M0 4h1M2 4h1M25 4h1M27 4h1M0 5h1M2 5h1M25      5h1M27 5h1M0 6h1M3 6h22M27 6h1M1 7h1M26 7h1M2 8h24",
  });
  const borderFill = e("path", {
    key: "borderFill",
    stroke: "#ffffff",
    d: "M2 1h24M1 2h2M25 2h2M1 3h1M26 3h1M1 4h1M26 4h1M1 5h1M26 5h1M1 6h2M25 6h2M2 7h24",
  });
  const defaultFill = e("path", {
    key: "defaultFill",
    stroke: "#858585",
    d: "M3 4h22M3 5h22",
  });
  const defaultFillHighlight = e("path", {
    key: "defaultFillHighlight",
    stroke: "#6f6f6f",
    d: "M3 3h22",
  });

  const percent = Math.floor((value / maxValue) * 100);
  const fill = PxBarFill({ percent });

  return e(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 -0.5 28 9",
      shapeRendering: "crispEdges",
      className: "px-bar",
    },
    border,
    borderFill,
    defaultFill,
    defaultFillHighlight,
    fill
  );
}

function PxBarApp() {
  const [value, setValue] = React.useState(100);
  const maxValue = 100;

  const down = e(
    "button",
    {
      onClick: () => {
        setValue((h) => Math.max(0, h - 10));
      },
    },
    "-"
  );

  const up = e(
    "button",
    {
      onClick: () => {
        setValue((h) => Math.min(maxValue, h + 10));
      },
    },
    "+"
  );

  const valueEl = e("div", { className: "px-bar-value" }, value);
  const bar = PxBar({ value, maxValue });
  const barContainer = e(
    "div",
    { className: "px-bar-container" },
    bar,
    valueEl
  );
  const actions = e("div", {}, down, up);

  return e(React.Fragment, {}, barContainer, actions);
}

export { PxBarApp };
