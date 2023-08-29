import {
  createMachine,
  raise,
  assign,
} from "https://unpkg.com/xstate@4.38.2/dist/xstate.web.js";

export const machine = createMachine(
  {
    id: "Circle Drawing Machine",
    initial: "DRAWING",
    context: {
      beforeEditCircles: null,
      circles: [],
      selectedCircleID: "",
      undoStack: [],
      redoStack: [],
      wasUpdated: false,
      prevCircles: [],
    },
    states: {
      DRAWING: {
        on: {
          CIRCLE_SELECT: {
            target: "EDITING",
          },
          UNDO: {
            cond: "canUndo",
            actions: {
              type: "undo",
              params: {},
            },
            internal: true,
          },
          REDO: {
            cond: "canRedo",
            actions: {
              type: "redo",
              params: {},
            },
            internal: true,
          },
        },
      },
      EDITING: {
        entry: ["startEditing"],
        exit: ["clearSelectedCircle", "exitEditing"],
        on: {
          CANVAS_CLICK: {
            target: "DRAWING",
          },
          CIRCLE_CHANGE: {
            actions: ["updateSelectedCircle"],
            internal: true,
          },
          PRESS_ESC: {
            target: "DRAWING",
          },
        },
      },
    },
    on: {
      CANVAS_CLICK: [
        {
          cond: "isOnCircle",
          actions: ["selectCircleUnderCursor", raise("CIRCLE_SELECT")],
          internal: true,
        },
        {
          actions: ["snapshot", "clearSelectedCircle", "addCircle"],
          internal: true,
        },
      ],
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      startEditing: assign({
        wasUpdated: false,
        prevCircles: (context) => {
          console.log(context.circles);
          return [...context.circles];
        },
      }),
      exitEditing: assign({
        wasUpdated: false,
        undoStack: (context) => {
          if (context.wasUpdated) {
            return [...context.undoStack, [...context.prevCircles]];
          }
          return context.undoStack;
        },
        redoStack: (context) => {
          if (context.wasUpdated) {
            return [];
          }
          return context.redoStack;
        },
      }),
      snapshot: assign({
        undoStack: (context) => {
          return [...context.undoStack, [...context.circles]];
        },
        redoStack: [],
      }),
      selectCircleUnderCursor: assign({
        selectedCircleID: (context, event) => {
          const { x, y, radius } = event;
          const circle = context.circles.find((circle) => {
            return Math.hypot(circle.x - x, circle.y - y) <= radius;
          });
          return circle.circleID;
        },
      }),
      updateSelectedCircle: assign({
        wasUpdated: true,
        circles: (context, { radius }) => {
          return context.circles.map((circle) => {
            if (circle.circleID === context.selectedCircleID) {
              return {
                ...circle,
                radius,
              };
            }
            return circle;
          });
        },
      }),
      clearSelectedCircle: assign({
        selectedCircleID: null,
      }),
      addCircle: assign({
        circles: (context, event) => {
          return [
            ...context.circles,
            {
              circleID: Math.random().toString(36).substr(2, 9),
              x: event.x,
              y: event.y,
              radius: event.radius,
            },
          ];
        },
      }),
      undo: assign({
        circles: (context) => {
          console.log(context);
          const undoStack = [...context.undoStack];
          const lastSnapshot = undoStack.pop();
          return lastSnapshot;
        },
        redoStack: (context) => {
          return [...context.redoStack, [...context.circles]];
        },
        undoStack: (context) => {
          return [...context.undoStack.slice(0, -1)];
        },
      }),
      redo: assign({
        circles: (context) => {
          const redoStack = [...context.redoStack];
          const lastSnapshot = redoStack.pop();
          return lastSnapshot;
        },
        undoStack: (context) => {
          return [...context.undoStack, [...context.circles]];
        },
        redoStack: (context) => {
          return [...context.redoStack.slice(0, -1)];
        },
      }),
    },
    services: {},
    guards: {
      isOnCircle: (context, event) => {
        const { x, y, radius } = event;
        return context.circles.some((circle) => {
          return Math.hypot(circle.x - x, circle.y - y) <= radius;
        });
      },
      canUndo: (context) => {
        return context.undoStack.length > 0;
      },
      canRedo: (context) => {
        return context.redoStack.length > 0;
      },
    },
    delays: {},
  }
);
