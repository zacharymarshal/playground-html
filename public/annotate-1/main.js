const { createElement: e, Fragment, useEffect, useState } = window.React;

function ScribbleIcon({ isActive }) {
  return e(
    "svg",
    {
      viewBox: "0 0 576 512",
      style: {
        width: "20px",
        height: "20px",
      },
    },
    e("path", {
      fill: isActive ? "#3e63dd" : "#000000",
      d: "M202 23.3C218.5 8.3 240 0 262.3 0h1.1C312.3 0 352 39.7 352 88.6c0 23.5-9.3 46-25.9 62.6L135.2 342.1c-4.6 4.6-7.2 10.9-7.2 17.4c0 13.6 11 24.6 24.6 24.6c6.5 0 12.8-2.6 17.4-7.2L392.8 153.9c16.6-16.6 39.1-25.9 62.6-25.9c48.9 0 88.6 39.7 88.6 88.6c0 23.5-9.3 46-25.9 62.6l-88.2 88.2c-8.8 8.8-13.8 20.9-13.8 33.4c0 26 21.1 47.1 47 47.1c6.2 0 12.4-1.5 18-4.2l16.7-8.4c15.8-7.9 35-1.5 42.9 14.3s1.5 35-14.3 42.9L509.6 501c-14.5 7.2-30.4 11-46.6 11c-61.4 0-111-49.9-111-111.1c0-29.5 11.7-57.8 32.6-78.7l88.2-88.2c4.6-4.6 7.2-10.9 7.2-17.4c0-13.6-11-24.6-24.6-24.6c-6.5 0-12.8 2.6-17.4 7.2L215.2 422.1c-16.6 16.6-39.1 25.9-62.6 25.9C103.7 448 64 408.3 64 359.4c0-23.5 9.3-46 25.9-62.6L280.8 105.9c4.6-4.6 7.2-10.9 7.2-17.4C288 75 277 64 263.4 64h-1.1c-6.4 0-12.6 2.4-17.3 6.7L85.5 215.7c-13.1 11.9-33.3 10.9-45.2-2.2s-10.9-33.3 2.2-45.2L202 23.3z",
    })
  );
}

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

function DrawingObject({ coords, posX, posY, color, opacity, size }) {
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
    stroke: color,
    strokeOpacity: opacity / 100,
    strokeWidth: size,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  });

  let minX = coords.reduce((acc, [cx]) => (cx < acc ? cx : acc), 0) - size;
  let maxX = coords.reduce((acc, [cx]) => (cx > acc ? cx : acc), 0) + size;
  const width = Math.max(DEFAULT_LENGTH, maxX) + Math.abs(minX);

  let minY = coords.reduce((acc, [, cy]) => (cy < acc ? cy : acc), 0) - size;
  let maxY = coords.reduce((acc, [, cy]) => (cy > acc ? cy : acc), 0) + size;
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

function DrawTool({ onDone, color, opacity, size }) {
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
      if (!isDrawing) {
        return;
      }

      // Save the final mouse position
      const pos = getMousePosition(e);
      const doneCoords = [...coords, [pos.x, pos.y]];
      onDone({ coords: doneCoords, posX, posY, color, opacity, size });
      setIsDrawing(false);
      setBuffer([]);
      setCoords([]);
    };
    window.addEventListener("mouseup", u);
    return () => {
      window.removeEventListener("mouseup", u);
    };
  }, [coords, posX, posY]);

  useEffect(() => {
    const d = (e) => {
      if (!e.target.matches(".draw-overlay")) {
        return;
      }
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

    svg = e(DrawingObject, {
      coords: tmpCoords,
      posX,
      posY,
      color,
      opacity,
      size,
    });
  }

  const overlay = e("div", { className: "draw-overlay" });

  return e(Fragment, {}, overlay, e("div", { className: "draw" }, svg));
}

function Annotate() {
  const [drawingObjects, setDrawingObjects] = useState([]);
  const [isOn, setIsOn] = useState(true);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(100);
  const [size, setSize] = useState(5);

  const onBtn = e(
    "button",
    {
      onClick: () => setIsOn((o) => !o),
    },
    e(ScribbleIcon, { isActive: isOn })
  );

  const colorPicker = e("input", {
    type: "color",
    value: color,
    onChange(e) {
      setColor(e.target.value);
    },
  });

  const opacitySlider = e("input", {
    type: "range",
    min: 0,
    max: 100,
    step: 10,
    value: opacity,
    onChange(e) {
      setOpacity(parseInt(e.target.value));
    },
  });

  const sizeSlider = e("input", {
    type: "range",
    min: 5,
    max: 25,
    step: 5,
    value: size,
    onChange(e) {
      setSize(parseInt(e.target.value));
    },
  });

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
      onBtn,
      sizeSlider,
      colorPicker,
      opacitySlider
    ),
    drawingObjectElements,
    isOn &&
      e(DrawTool, {
        color,
        opacity,
        size,
        onDone(drawingObject) {
          setDrawingObjects((l) => {
            const d = {
              ...drawingObject,
              id: l.length + 1,
            };
            return [...l, d];
          });
        },
      })
  );
}

const domContainer = document.querySelector("#annotate");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Annotate));
