const { createElement: e, Fragment, useEffect, useState } = window.React;

const DEFAULT_LENGTH = 50;

function Layer({ coords, posX, posY }) {
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
  const twidth = Math.max(DEFAULT_LENGTH, maxX) + Math.abs(minX);

  let minY = coords.reduce((acc, [cx, cy]) => (cy < acc ? cy : acc), 0) - 5;
  let maxY = coords.reduce((acc, [cx, cy]) => (cy > acc ? cy : acc), 0) + 5;
  const theight = Math.max(DEFAULT_LENGTH, maxY) + Math.abs(minY);

  return e(
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
}

function DrawTool({ onDone }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    const u = () => {
      console.log("mouseup");
      onDone({ coords, posX, posY });
      setIsDrawing(false);
    };
    window.addEventListener("mouseup", u);
    return () => {
      window.removeEventListener("mouseup", u);
    };
  }, [coords, posX, posY]);

  useEffect(() => {
    const d = (e) => {
      e.preventDefault();
      console.log("mousedown", e);
      setIsDrawing(true);
      setPosX(e.pageX - DEFAULT_LENGTH / 2);
      setPosY(e.pageY - DEFAULT_LENGTH / 2);
      setCoords([[DEFAULT_LENGTH / 2, DEFAULT_LENGTH / 2]]);
    };
    window.addEventListener("mousedown", d);

    const m = (e) => {
      if (!isDrawing) {
        return;
      }
      setCoords((c) => [...c, [e.pageX - posX, e.pageY - posY]]);
    };
    window.addEventListener("mousemove", m);

    return () => {
      window.removeEventListener("mousedown", d);
      window.removeEventListener("mousemove", m);
    };
  }, [isDrawing, posX, posY]);

  const svg = e(Layer, { coords, posX, posY });

  const overlay = e("div", { className: "draw-overlay" });

  return e(
    Fragment,
    {},
    overlay,
    e(
      "div",
      {
        className: "draw",
      },
      svg
    )
  );
}

function Annotate() {
  const [layers, setLayers] = useState([]);
  const [isOn, setIsOn] = useState(false);

  const onBtn = e(
    "button",
    {
      onClick: () => setIsOn((o) => !o),
    },
    isOn ? "OFF" : "ON"
  );

  // TODO: add id for key
  const layerElements = layers.map((l) => e(Layer, l));

  return e(
    Fragment,
    {},
    e(
      "div",
      {
        className: "annotate-toolbar",
      },
      onBtn
    ),
    isOn &&
      e(DrawTool, {
        onDone(layer) {
          setLayers((l) => [...l, layer]);
        },
      }),
    layerElements
  );
}
const domContainer = document.querySelector("#annotate");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Annotate));
