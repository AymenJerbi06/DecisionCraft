import { fetchRoot, fetchNext } from "./api.js";
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
    ui.meta.textContent = `Run: ${runId} ${leader?.id ?? ""}`;
}

async function onChoose(choice) {
    try {
        applyEffects(choice.effects);
        history.push(choice.id);
        renderState();

        ui.meta.textContent = `Generating next decision...`;

        const nextPayload = await fetchNext({
            run_id: runId,
            year: year,
            leader_id: leader.id,
            history: history,
            state: snapshotState(),
        });

        renderNode(nextPayload);
    } catch (err) {
        console.error("Error fetching next node:", err);
        ui.meta.textContent = `Error fetching next node: ${err.message}`;
    }
}

async function startNewRun() {
    try{
        ui.meta.textContent = `Starting new run...`;
        resetState();
        history = [];

        const rootPayload = await fetchRoot();
        renderNode(rootPayload);
    } catch (err) {
        console.error("Error starting new run:", err);
        ui.meta.textContent = `Error starting new run: ${err.message}`;
    }
}


ui.reset.addEventListener("click", startNewRun);

// Initialize the app
startNewRun();
