const DEFAULT_STATE = {
    centralized_power: 0,
    military_professionalism: 0,
    ideological_unity: 0,
    information_control: 0,
    economic_scale: 0,
    technological_innovation: 0,
};

let state = structuredClone(DEFAULT_STATE);

export function getState() {
    return state;
}

export function resetState() {
    state = structuredClone(DEFAULT_STATE);
}

export function applyEffects(effects) {
    for (const [key, value] of Object.entries(effects || {})) {
        if (typeof value === 'number') {
            state[key] = (state[key] ?? 0) + value;
        } else {
            state[key] = value;
        }
    }
}

export function snapshotState() {
    return structuredClone(state);
}



