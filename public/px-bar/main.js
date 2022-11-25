import { PxBarApp } from "./PxBar.js";

const e = React.createElement;
const domContainer = document.querySelector("#px-bar-app");
const root = ReactDOM.createRoot(domContainer);
root.render(e(PxBarApp));
