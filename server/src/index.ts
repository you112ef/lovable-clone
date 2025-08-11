import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Daytona } from '@daytonaio/sdk';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-daytona', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  if (!process.env.DAYTONA_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Missing API keys' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    const sandbox = await daytona.create({ public: true, image: 'node:20' });
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;

    const write = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    write({ type: 'progress', message: `Sandbox created: ${sandbox.id}` });

    await sandbox.process.executeCommand(`mkdir -p ${projectDir}`, rootDir);
    await sandbox.process.executeCommand('npm init -y', projectDir);
    write({ type: 'progress', message: 'Initialized project' });

    const install = await sandbox.process.executeCommand(
      'npm install @anthropic-ai/claude-code@latest',
      projectDir,
      undefined,
      180000
    );
    if (install.exitCode !== 0) {
      write({ type: 'error', message: 'Failed to install Claude Code SDK' });
      return res.end();
    }

    const generationScript = `const { query } = require('@anthropic-ai/claude-code');\nconst fs = require('fs');\n(async function() {\n  const messages = [];\n  const abortController = new AbortController();\n  for await (const message of query({ prompt: ${JSON.stringify(prompt)}, abortController, options: { maxTurns: 20, allowedTools: ['Read','Write','Edit','MultiEdit','Bash','LS','Glob','Grep'] } })) {\n    if (message.type === 'text') {\n      console.log('__CLAUDE_MESSAGE__ ' + JSON.stringify({ type: 'assistant', content: message.text }));\n    } else if (message.type === 'tool_use') {\n      console.log('__TOOL_USE__ ' + JSON.stringify({ type: 'tool_use', name: message.name, input: message.input }));\n    } else if (message.type === 'result') {\n      console.log('__TOOL_RESULT__ ' + JSON.stringify({ type: 'tool_result' }));\n    }\n  }\n})();`;

    await sandbox.process.executeCommand(
      `bash -lc "cat > generate.js << 'SCRIPT_EOF'\n${generationScript}\nSCRIPT_EOF"`,
      projectDir
    );

    const run = await sandbox.process.executeCommand(
      `node generate.js`,
      projectDir,
      { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
      600000
    );

    const lines = run.result?.split('\n') || [];
    for (const line of lines) {
      if (!line.trim()) continue;
      if (line.includes('__CLAUDE_MESSAGE__')) {
        try {
          write({ type: 'claude_message', content: JSON.parse(line.split('__CLAUDE_MESSAGE__')[1].trim()).content });
        } catch {}
      } else if (line.includes('__TOOL_USE__')) {
        try {
          const obj = JSON.parse(line.split('__TOOL_USE__')[1].trim());
          write({ type: 'tool_use', name: obj.name, input: obj.input });
        } catch {}
      } else {
        write({ type: 'progress', message: line.trim() });
      }
    }

    const preview = await sandbox.getPreviewLink(3000);
    write({ type: 'complete', sandboxId: sandbox.id, previewUrl: preview.url });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on :${port}`);
});