// From the data/characters.json file, use OpenAI to generate a prompt, context, and 3 choices for the given character ID.
require("dotenv").config();

const ruleset = "Make sure that any generated content is short, consise and not overly verbose. The generated content should be based from the previous choices from the user, and it should reflect the changes made. For example, if a choice avoids a war and the next character is a part of such war, then the next round of choices should reflect that change. If the choices do not contradict such changes, then the generated choices should be as close to historically accurate as possible with respect to the characters' personalities and ideals. For example, assume that Hitler will always do what he did no matter the previous choices. When asked about the prompt, only give a prompt. When asked about the context, only give the context. When asked about the choices, only give the choices. Do not give any more than what you asked for. Ensure that the generated content is historically plausible and does not contain hallucinations.",

// Initialize headers
headers = {
    "Authorization": `Bearer ${process.env.GITHUB_API_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2024-06-05",
    "Content-Type": "application/json"
}

// Generate a node for a given character ID
async function generateNode(characterId, previousResults) {
    const character = await fetch("/character/" + characterId).then(res => res.json());
    
    // If character not found, throw an error
    if (!character) {
        throw new Error(`Character with ID ${characterId} not found.`);
    }

    // Create prompts for OpenAI
    const prompt_prompt = "Generate a sentence-long prompt describing a significant historical event or decision involving the following figure: " + character.figure + " in the year " + character.year + "." + " Consider all previous results: " + (previousResults.join(" ") || "N/A");
    const context_prompt = "Generate a sentence-long context providing background information relevant to the prompt about " + character.figure + " in " + character.year + "." + " Consider all previous results: " + (previousResults.join(" ") || "N/A");
    const choices_prompt = "Generate 3 distinct choices for the following prompt: " + prompt_prompt + " Consider all previous results: " + (previousResults.join(" ") || "N/A");

    // Fetch prompt, context, and choices from OpenAI
    const prompt_response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: "openai/gpt-4.1",
            messages: [
                {
                    "role": "system",
                    "content": ruleset
                },
                {
                    "role": "user",
                    "content": prompt_prompt
                }
            ]
        })
    });

    if (!prompt_response.ok) {
        throw new Error(`Failed to generate prompt: ${prompt_response.statusText}`);
    }
    
    const prompt_data = await prompt_response.json();
    const prompt = prompt_data.choices[0].message.content;

    const context_response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: "openai/gpt-4.1",
            messages: [
                {
                    "role": "system",
                    "content": ruleset
                },
                {
                    "role": "user",
                    "content": context_prompt
                }
            ]
        })
    });

    if (!context_response.ok) {
        throw new Error(`Failed to generate context: ${context_response.statusText}`);
    }

    const context_data = await context_response.json();
    const context = context_data.choices[0].message.content;

    const choices_response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: "openai/gpt-4.1",
            messages: [
                {
                    "role": "system",
                    "content": ruleset
                },
                {
                    "role": "user",
                    "content": choices_prompt
                }
            ]
        })
    });

    if (!choices_response.ok) {
        throw new Error(`Failed to generate choices: ${choices_response.statusText}`);
    }

    const choices_data = await choices_response.json();
    const choices = choices_data.choices[0].message.content;

    // Return the generated prompt, context, and choices
    return {
        prompt: prompt,
        context: context,
        choices: choices
    };
}

// Given a prompt and the user's choice, generate a summary of the outcome
async function generateOutcome(prompt, choice) {
    const outcome_prompt = `Based on the prompt: "${prompt}" and the user's choice: "${choice}", generate a sentence-long summary of the outcome of this decision. ${ruleset}`;
    const outcome_response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: "openai/gpt-4.1",
            messages: [
                {
                    "role": "system",
                    "content": ruleset
                },
                {
                    "role": "user",
                    "content": outcome_prompt
                }
            ]
        })
    });

    if (!outcome_response.ok) {
        throw new Error(`Failed to generate outcome: ${outcome_response.statusText}`);
    }

    const outcome_data = await outcome_response.json();
    return outcome_data.choices[0].message.content;
}

module.exports = {
    generateNode,
    generateOutcome
};