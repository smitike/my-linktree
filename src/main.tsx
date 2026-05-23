import React from "react";
import ReactDOM from "react-dom/client";
import { LinkTree } from "./components/linktree/link-tree";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LinkTree />
  </React.StrictMode>,
);
