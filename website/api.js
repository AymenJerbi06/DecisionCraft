export async function fetchNode(nodeId) {
    const res = await fetch(`/character/${nodeId}}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch node with ID ${nodeId}: ${res.statusText}`);
        return await res.json();
    }
}

export async function fetchRoot() {
    const res = await fetch('/api/root');
    if (!res.ok) {
        throw new Error(`Failed to fetch root node: ${res.statusText}`);
    }
    return await res.json();
}

export async function fetchNext({year, leader, state, history}) {
    const res = await fetch("/api/next", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({year, leader, state, history}),
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch next node: ${res.statusText}`);
    }
    return await res.json();
}