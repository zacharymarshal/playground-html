const { createElement: e, Fragment, useEffect, useState } = window.React;

function getAverageCoord(buffer) {
  if (!buffer.length) {
    return;
  }

  const totalX = buffer.reduce((acc, { x }) => {
    acc += x;
    return acc;
  }, 0);
  const totalY = buffer.reduce((acc, { y }) => {
    acc += y;
    return acc;
  }, 0);

  return {
    x: totalX / buffer.length,
    y: totalY / buffer.length,
  };
}

const DEFAULT_LENGTH = 50;

function DrawingObject({ coords, posX, posY }) {
  const [mx, my] = coords[0];
  const pathStr =
    `M ${mx} ${my} ` +
    coords
      .map(([cx, cy]) => {
        return `L ${cx} ${cy}`;
      })
      .join(" ");

  const path = e("path", {
    d: pathStr,
    fill: "none",
    stroke: "#000",
    strokeWidth: 5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  });

  let minX = coords.reduce((acc, [cx]) => (cx < acc ? cx : acc), 0) - 5;
  let maxX = coords.reduce((acc, [cx]) => (cx > acc ? cx : acc), 0) + 5;
  const width = Math.max(DEFAULT_LENGTH, maxX) + Math.abs(minX);

  let minY = coords.reduce((acc, [, cy]) => (cy < acc ? cy : acc), 0) - 5;
  let maxY = coords.reduce((acc, [, cy]) => (cy > acc ? cy : acc), 0) + 5;
  const height = Math.max(DEFAULT_LENGTH, maxY) + Math.abs(minY);

  return e(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      style: {
        position: "absolute",
        left: posX + minX,
        top: posY + minY,
        width,
        height,
      },
      viewBox: `${minX} ${minY} ${width} ${height}`,
    },
    path
  );
}

function DrawTool({ onDone }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [coords, setCoords] = useState();
  const [buffer, setBuffer] = useState([]);

  const getMousePosition = (e) => {
    return {
      x: e.pageX - posX,
      y: e.pageY - posY,
    };
  };

  useEffect(() => {
    const u = (e) => {
      // Save the final mouse position
      const pos = getMousePosition(e);
      const doneCoords = [...coords, [pos.x, pos.y]];
      onDone({ coords: doneCoords, posX, posY });
      setIsDrawing(false);
      setBuffer([]);
    };
    window.addEventListener("mouseup", u);
    return () => {
      window.removeEventListener("mouseup", u);
    };
  }, [coords, posX, posY]);

  useEffect(() => {
    const d = (e) => {
      e.preventDefault();
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

      setBuffer((b) => {
        const pos = getMousePosition(e);
        // Ignore duplicates
        const lastPos = b[b.length - 1];
        if (lastPos && lastPos.x === pos.x && lastPos.y === pos.y) {
          return b;
        }
        return [...b, pos].slice(-12);
      });
    };
    window.addEventListener("mousemove", m);

    return () => {
      window.removeEventListener("mousedown", d);
      window.removeEventListener("mousemove", m);
    };
  }, [isDrawing, posX, posY, buffer]);

  useEffect(() => {
    const a = getAverageCoord(buffer);
    if (a) {
      setCoords((c) => [...c, [a.x, a.y]]);
    }
  }, [buffer]);

  let svg;
  if (coords?.length) {
    const tmpCoords = [...coords];
    for (let o = 0; o < buffer.length; o += 2) {
      const c = getAverageCoord(buffer.slice(o));
      tmpCoords.push([c.x, c.y]);
    }

    svg = e(DrawingObject, { coords: tmpCoords, posX, posY });
  }

  const overlay = e("div", { className: "draw-overlay" });

  return e(Fragment, {}, overlay, e("div", { className: "draw" }, svg));
}

function Annotate() {
  const [drawingObjects, setDrawingObjects] = useState([]);
  const [isOn, setIsOn] = useState(true);

  const onBtn = e(
    "button",
    {
      onClick: () => setIsOn((o) => !o),
    },
    isOn ? "OFF" : "ON"
  );

  const drawingObjectElements = drawingObjects.map((d) => {
    return e(DrawingObject, { ...d, key: d.id });
  });

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
        onDone(drawingObject) {
          setDrawingObjects((l) => {
            const d = {
              ...drawingObject,
              id: l.length + 1,
            };
            return [...l, d];
          });
        },
      }),
    drawingObjectElements
  );
}

const domContainer = document.querySelector("#annotate");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Annotate));
