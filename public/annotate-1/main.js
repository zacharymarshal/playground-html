const { createElement: e, Fragment, useEffect, useState } = React;

function Annotate() {
  const [isOn, setIsOn] = useState(false);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [coords, setCoords] = useState([]);
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  useEffect(() => {
    if (!isOn) {
      return;
    }

    let isDrawingYup = false;
    let posXYup = 0;
    let posYYup = 0;
    const d = (e) => {
      e.preventDefault();
      console.log("mousedown", e);
      isDrawingYup = true;
      setPosX(e.pageX - width / 2);
      posXYup = e.pageX - width / 2;
      setPosY(e.pageY - height / 2);
      posYYup = e.pageY - height / 2;
      setCoords([[width / 2, height / 2]]);
    };
    window.addEventListener("mousedown", d);

    const u = () => {
      isDrawingYup = false;
      console.log("mouseup");
    };
    window.addEventListener("mouseup", u);

    const m = (e) => {
      if (!isDrawingYup) {
        return;
      }
      console.log({ posXYup, x: e.pageX });
      setCoords((c) => [...c, [e.pageX - posXYup, e.pageY - posYYup]]);
    };
    window.addEventListener("mousemove", m);

    return () => {
      window.removeEventListener("mousedown", d);
      window.removeEventListener("mouseup", u);
      window.removeEventListener("mousemove", m);
    };
  }, [isOn]);

  const [mx, my] = coords[0] || [0, 0];
  const pathStr =
    `M${mx} ${my} ` +
    coords
      .slice(1)
      .map(([cx, cy]) => `L${cx} ${cy}`)
      .join(" ");
  const path = e("path", {
    d: pathStr,
    fill: "none",
    stroke: "#000",
    strokeWidth: 2,
  });

  let minX = coords.reduce((acc, [cx, cy]) => (cx < acc ? cx : acc), 0) - 5;
  let maxX = coords.reduce((acc, [cx, cy]) => (cx > acc ? cx : acc), 0) + 5;
  const twidth = Math.max(width, maxX) + Math.abs(minX);

  let minY = coords.reduce((acc, [cx, cy]) => (cy < acc ? cy : acc), 0) - 5;
  let maxY = coords.reduce((acc, [cx, cy]) => (cy > acc ? cy : acc), 0) + 5;
  const theight = Math.max(height, maxY) + Math.abs(minY);

  const svg = e(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      style: {
        position: "absolute",
        left: posX + minX,
        top: posY + minY,
        width: twidth,
        height: theight,
      },
      viewBox: `${minX} ${minY} ${twidth} ${theight}`,
    },
    path
  );

  const onBtn = e(
    "button",
    {
      onClick: () => setIsOn(true),
    },
    "ON"
  );

  const overlay = e("div", { className: "draw-overlay" });

  return e(
    Fragment,
    {},
    isOn && overlay,
    e(
      "div",
      {
        className: "draw",
      },
      !isOn && onBtn,
      svg
    )
  );
}
const domContainer = document.querySelector("#annotate");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Annotate));
