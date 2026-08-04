const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\2c4ed0c0-3d2a-4c26-8a05-240e521cc809\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
    console.log("TOTAL STEPS:", lines.length);
    // Print the last 20 steps
    const lastSteps = lines.slice(-20);
    for (const stepStr of lastSteps) {
        try {
            const step = JSON.parse(stepStr);
            console.log(`STEP: idx=${step.step_index}, type=${step.type}, source=${step.source}`);
            if (step.type === 'USER_INPUT') {
                console.log("  USER INPUT:", step.content);
            }
        } catch (e) {
            console.log("Error parsing step:", e.message);
        }
    }
} else {
    console.log("Log path not found");
}
