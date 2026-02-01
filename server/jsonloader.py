# Import necessary libraries
from flask import Flask, jsonify
import json

# Initialize Flask app
app = Flask(__name__)

# Load JSON data from file
with open("./data/characters.json", "r") as file:
    RAW_DATA = json.load(file)

# Convert list of events to a dictionary with IDs as keys for easy access
CHARACTER_DATA = {char["id"]: char for char in RAW_DATA}

# Define route to get character data by ID
@app.route('/character/<int:char_id>', methods=['GET'])
def get_data(char_id):
    """Endpoint to retrieve character data by ID."""
    character = CHARACTER_DATA.get(char_id)
    if character:
        return jsonify(character)
    else:
        return jsonify({"error": "Character not found"}), 404

# Run in debug mode if executed as main program
if __name__ == '__main__':

    # Test print to verify data loading
    print(CHARACTER_DATA.get(1))