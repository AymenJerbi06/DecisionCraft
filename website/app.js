import { fetchNode } from "./api.js";
import { getState, applyEffects, resetState, snapshotState } from "./state.js";

const el = (id) => document.getElementById(id);

const ui = {
    prompt: el("node-prompt"),
    choices: el("node-choices"),
    context: el("node-context"),
    meta: el("node-meta"),
    worldstate: el("node-world-state"),
    reset: el("node-reset"),
    title: el("node-title"),
    subtitle: el("node-subtitle"),
};

let year = -216 
let currentNodeId = "Hannibal Barca";
let history = [];

function renderState() {
    ui.worldstate.textContent = JSON.stringify(getState(), null, 2);
}

function renderNode(payload) {
    runId = payload.run_id;
    year = payload.year;
    leader = payload.leader;

    ui.title.textContent = leader?.name ?? "Unknown Leader";
    ui.subtitle.textContent = `Year: ${year}`;
    ui.prompt.textContent = payload.node?.prompt ?? "No prompt available.";

    //Context Bullets
    ui.context.innerHTML = "";
    (payload.node?.context ?? []).foreach ((line) => {
        const li = document.createElement("li");
        li.textContent = li;
        ui.context.appendChild(li);
    });

    //Choice Buttons
    ui.choices.innerHTML = "";
    (payload.node?.choices ?? []).forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "choice-button";
        btn.textContent = choice.label ?? choice.id;
        
        btn.addEventListener("click",  () =>  onChoose(choice));
        ui.choices.appendChild(btn);
    });

    renderState();
    ui.meta.textContent = `Run: ${runId} `;

}

ui.reset.addEventListener("click", async() => {
    resetState();
    history = [];

    const res = await fetchRoot();
    year = res.year;
    leader = res.leader;
    renderNode(res.node);
});

(async function init() {
    const res = await fetchRoot();
    year = res.year;
    leader = res.leader;
    renderNode(res.node);
})();

