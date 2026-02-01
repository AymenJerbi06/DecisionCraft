ruleset = "Make sure that any generated content is short, consise and not overly verbose. The generated content should be based from the previous choices from the user, and it should reflect the changes made. For example, if a choice avoids a war and the next character is a part of such war, then the next round of choices should reflect that change. If the choices do not contradict such changes, then the generated choices should be as close to historically accurate as possible with respect to the characters' personalities and ideals. For example, assume that Hitler will always do what he did no matter the previous choices. When asked about the prompt, only give a prompt. When asked about the context, only give the context. When asked about the choices, only give the choices. Do not give any more than what you asked for. Ensure that the generated content is historically plausible and does not contain hallucinations."

import asyncio
from flask import json
from dotenv import load_dotenv
import requests
import os
load_dotenv()

API_URL = "https://models.github.ai/inference/chat/completions"
TOKEN = os.getenv("GITHUB_API_TOKEN")

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2024-06-05",
    "Content-Type": "application/json"
}

with open("./data/characters.json", "r") as f:
    RAW_DATA = json.load(f)

CHARACTER_DATA = {char["id"]: char for char in RAW_DATA}

async def generate_node(character_id, previous_results = None):
    payload = {
        "model": "openai/gpt-4.1",
        "messages": [
            {
                "role": "system",
                "content": ruleset
            },
            {
                "role": "user",
                "content": f"Ask the user what they would do if they were the historical figure {CHARACTER_DATA[character_id]['figure']} based on the previous choices: {previous_results}. {ruleset}"
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    return data.get("choices")[0].get("message").get("content")

if __name__ == "__main__":
    result = asyncio.run(generate_node(1))
    print(result)