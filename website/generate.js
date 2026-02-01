// From the data/characters.json file, use OpenAI to generate a prompt, context, and 3 choices for the given character ID.
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

require("dotenv").config();

const ruleset = "Make sure that any generated content is short, consise and not overly verbose. The generated content should be based from the previous choices from the user, and it should reflect the changes made. For example, if a choice avoids a war and the next character is a part of such war, then the next round of choices should reflect that change. If the choices do not contradict such changes, then the generated choices should be as close to historically accurate as possible with respect to the characters' personalities and ideals. For example, assume that Hitler will always do what he did no matter the previous choices.";

// Initialize OpenAI API client
const client = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
}));

const non_hallucinatory_prompt = "Ensure that the generated content is historically plausible and does not contain hallucinations.";

// Generate a node for a given character ID
async function generateNode(characterId, previousResults) {
    const character = await fetch("/character/" + characterId).then(res => res.json());
    
    // If character not found, throw an error
    if (!character) {
        throw new Error(`Character with ID ${characterId} not found.`);
    }

    // Create prompts for OpenAI
    const prompt_prompt = non_hallucinatory_prompt + " Generate a sentence-long prompt describing a significant historical event or decision involving the following figure: " + character.figure + " in the year " + character.year + "." + " Consider all previous results: " + (previousResults.join(" ") || "N/A") + non_hallucinatory_prompt;
    const context_prompt = non_hallucinatory_prompt + " Generate a sentence-long context providing background information relevant to the prompt about " + character.figure + " in " + character.year + "." + " Consider all previous results: " + (previousResults.join(" ") || "N/A") + non_hallucinatory_prompt;
    const choices_prompt = non_hallucinatory_prompt + " Generate 3 distinct choices for the following prompt: " + prompt_prompt + " Each choice should have a label and an effect on the world state represented as a JSON object with numerical values for 'centralized_power', 'military_professionalism', 'ideological_unity', 'information_control', 'economic_scale', and 'technological_innovation'. Format the choices as a JSON array." + " Consider all previous results: " + (previousResults.join(" ") || "N/A") + non_hallucinatory_prompt;

    // Call OpenAI API to generate prompt, context, and choices
    const [promptRes, contextRes, choicesRes] = await Promise.all([
        client.createCompletion({
            model: "text-davinci-003",
            prompt: prompt_prompt,
            max_tokens: 60,
            temperature: 0.7,
        }),
        client.createCompletion({
            model: "text-davinci-003",
            prompt: context_prompt,
            max_tokens: 60,
            temperature: 0.7,
        }),
        client.createCompletion({
            model: "text-davinci-003",
            prompt: choices_prompt,
            max_tokens: 200,
            temperature: 0.7,
        }),
    ]);

    // Parse the results
    const prompt = promptRes.data.choices[0].text.trim();
    const context = contextRes.data.choices[0].text.trim();
    let choices;
    try {
        choices = JSON.parse(choicesRes.data.choices[0].text.trim());
    } catch (e) {
        throw new Error(`Failed to parse choices JSON: ${e.message}`);
    }

    // Return the generated node
    return {
        id: characterId,
        figure: character.figure,
        year: character.year,
        prompt,
        context,
        choices,
    };
}   

async function generateOutcome(previousContext, previousChoices, chosenChoice) {
    const outcome_prompt = "Based on the previous context: " + previousContext + " and the choices: " + JSON.stringify(previousChoices) + ", generate a simple sentence summarizing the chosen choice: " + chosenChoice + ". " + non_hallucinatory_prompt;

    const outcomeRes = await client.createCompletion({
        model: "text-davinci-003",
        prompt: outcome_prompt,
        max_tokens: 150,
        temperature: 0.7,
    });

    return outcomeRes.data.choices[0].text.trim();
}

// Example usage
(async () => {
    try {
        const characterId = 1; // Example character ID
        const previousResults = []; // Example previous results
        const node = await generateNode(characterId, previousResults);
        console.log("Generated Node:", node);
        const outcome = await generateOutcome(node.context, node.choices, node.choices[0].label);
        console.log("Generated Outcome:", outcome);
    } catch (error) {
        console.error("Error generating node or outcome:", error);
    }
})();