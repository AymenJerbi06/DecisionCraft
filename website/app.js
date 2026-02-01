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

function renderNode(node) {
    ui.prompt.textContent = node.prompt ?? "";
    ui.title.textContent = leader;
    ui.subtitle.textContent = `Year: ${year}`;
    ui.explanation.textContent = JSON.stringify(node.explanation, null, 2) ?? "";

    ui.context.innerHTML = "";
    (node.context ?? []).forEach((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        ui.context.appendChild(li);
    });

    ui.choices.innerHTML = "";
    (node.choices ?? []).forEach((choice) => {
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = choice.label;

        button.addEventListener("click", async () => {
            applyEffects(choice.effects);
            history.push(choice.id);
            renderState();

            ui.meta.textContent = `Loading node ${choice.next}...`;
            const res = await fetchNext({
                year,
                leader,
                state: snapshotState(),
                history,    
            });
            year = res.year;
            leader = res.leader;
            renderNode(res.node);
            ui.meta.textContent = "Ready";
        });
        ui.choices.appendChild(button);
    });

    renderState();
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

