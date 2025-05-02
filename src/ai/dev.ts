import '@/ai/flows/resume-analysis.ts';
// This file is primarily for local Genkit development and inspection.
// You can import other flows here if you want to test them via the Genkit UI.

// Example: If you had another flow:
// import '@/ai/flows/another-flow.ts';

console.log("Genkit development server starting with imported flows...");

// If using the pythonBridge plugin (which is NOT configured by default):
// You might import Python flow definitions if they were exposed via the bridge.
// import { pythonFlow } from './path/to/python/flow_definition';
// However, based on the current setup, Python code is not directly run by Genkit.
// The Python code provided seems intended for a separate Gradio interface or as a reference.
// The Genkit flow `resume-analysis.ts` reimplements the core logic using the Gemini API via Genkit.

```