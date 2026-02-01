from flask import Flask, jsonify, request
import secrets

app = Flask(__name__)

DEFAULT_STATE = {
    "centralized_power" : 0,
    "military_professionalism" : 0,
    "ideological_unity" : 0,
    "information_control" : 0,
    "economic_scale" : 0,
    "technological_innovation" : 0
}

START = {
    "year" : -216,
    "leader" : {"id" : "hannibal_barca","name" : "Hannibal Barca"}
}

@app.get("/api/state")
def api_root():
    run_id = secrets.token_hex(4)

    year = START["year"]
    leader = START["leader"]
    state = dict(DEFAULT_STATE)
    history = []

    node = {
        "id" : "root",
        "prompt" : "After Canne, Hannibal must decide his next move in the Second Punic War against Rome.",
        "context" : [
            "You are Hannibal Barca, the Carthaginian general known for your tactical genius.",
            "The year is 216 BC, and you have just achieved a significant victory against Rome at the Battle of Cannae.",
            "Your army is strong, but you are deep in enemy territory and must decide your next move carefully."
        ],
        "choices" : [
            {
                "id" : "march_rome",
                "text" : "March directly on Rome to capitalize on the victory."
            },
            {
                "id" : "secure_supply",
                "text" : "Secure supply lines and reinforce your position in Italy."
            },
            {
                "id" : "seek_allies",
                "text" : "Seek alliances with other Italian states to weaken Rome's influence."
            }
        ]
    }

    return jsonify({
        "run_id" : run_id,
        "year" : year,
        "leader" : leader,
        "node" : node
    })

@app.post("/api/next")
def api_next():
    payload = request.get_jsons(silent = True) or {}
    run_id = payload.get("run_id")

    if not run_id:
        return jsonify({"error" : "Missing run_id"}), 400
    
    year = int(payload.get("year", START["year"]))
    leader_id = payload.get("leader_id", START["leader"]["id"])
    state = payload.get("state", dict(DEFAULT_STATE))
    history = payload.get("choice_id")

    node = {
        "id" : "next_node",
        "prompt" : "Hannibal must decide his next move after the victory at Cannae.",
        "context" : [
            "You are Hannibal Barca, the Carthaginian general known for your tactical genius.",
            "The year is 216 BC, and you have just achieved a significant victory against Rome at the Battle of Cannae.",
            "Your army is strong, but you are deep in enemy territory and must decide your next move carefully."
        ],
        "choices" : [
            {
                "id" : "march_rome",
                "text" : "March directly on Rome to capitalize on the victory."
            },
            {
                "id" : "secure_supply",
                "text" : "Secure supply lines and reinforce your position in Italy."
            },
            {
                "id" : "seek_allies",
                "text" : "Seek alliances with other Italian states to weaken Rome's influence."
            }
        ]
    }

    next_year = year + 2
    next_leader = {"id" : leader_id, "name" : "Hannibal Barca"}
    
    return jsonify({
        "run_id" : run_id,
        "year" : next_year, 
        "leader" : next_leader,
        "node" : node
    })

if __name__ == "__main__":
    app.run(debug=True)