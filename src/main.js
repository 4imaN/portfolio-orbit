import "./style.css";
import { projects } from "./projects.js";

const dialog = document.querySelector("#project-dialog");
export function openProject(project) {
  document.querySelector("#dialog-symbol").textContent = project.symbol;
  document.querySelector("#dialog-symbol").style.color = project.color;
  document.querySelector("#dialog-index").textContent =
    `SATELLITE ${project.id} / ${project.category}`;
  document.querySelector("#dialog-title").textContent = project.name;
  document.querySelector("#dialog-description").textContent =
    project.description;
  document.querySelector("#dialog-platform").textContent = project.platform;
  document.querySelector("#dialog-status").textContent = project.status;
  document.querySelector("#dialog-stack").replaceChildren(
    ...project.stack.map((item) => {
      const span = document.createElement("span");
      span.textContent = item;
      return span;
    }),
  );
  document.querySelector("#dialog-source").href =
    `https://github.com/4imaN/${project.repo}`;
  if (!dialog.open) {
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }
}
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
});
document
  .querySelector("#dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    dialog.close();
});
const list = document.querySelector("#project-list");
projects.forEach((project) => {
  const row = document.createElement("button");
  row.className = "project-row";
  row.style.setProperty("--project-color", project.color);
  row.setAttribute("aria-label", `Explore ${project.name}`);
  row.innerHTML = `<span class="project-number">${project.id}</span><span class="project-art" aria-hidden="true">${project.symbol}</span><span><h3>${project.name}</h3><span class="category">${project.category}</span></span><span class="project-short">${project.short}</span><span class="project-arrow" aria-hidden="true">↗</span>`;
  row.addEventListener("click", () => openProject(project));
  list.appendChild(row);
});
const email = "like93860@gmail.com";
document.querySelector("#copy-email").addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(email);
    status.textContent = "COPIED TO CLIPBOARD";
  } catch {
    status.textContent = "Select the email address to copy it.";
  }
});
function updateTime() {
  document.querySelector("#local-time").textContent =
    `ADDIS ABABA · ${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Addis_Ababa", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`;
}
updateTime();
setInterval(updateTime, 60000);
// The content and navigation remain usable even when WebGL is unavailable.
import("./orbit.js")
  .then(({ mountOrbit }) => mountOrbit(projects, openProject))
  .catch((error) => {
    document.querySelector("#universe").classList.add("no-webgl");
    document.querySelector("#scene-hint").textContent =
      "EXPLORE THE PROJECTS BELOW ↓";
    console.warn(
      "Orbit visual unavailable; project list remains accessible.",
      error.message,
    );
  });
