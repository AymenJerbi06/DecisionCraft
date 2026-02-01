
export async function fetchRoot() {
    const res = await fetch('/api/root');
    if (!res.ok) {
        throw new Error(`Failed to fetch root node: ${res.statusText}`);
    }
    return await res.json();
}

export async function fetchNext(payload) {
    const res = await fetch("/api/next", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch next node: ${res.statusText}`);
    }
    return await res.json();
}