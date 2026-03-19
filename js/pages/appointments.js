import { renderSideBar } from "../components/sidebar.js";

let sideBar = document.querySelector(".side-bar");
sideBar.innerHTML = renderSideBar("appointments");