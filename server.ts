import {
  AnthropicModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "npm:rxjs-for-await";
import "https://deno.land/std@0.211.0/dotenv/load.ts";

// ==========================================
// 1. Configuration & Initialization
// ==========================================

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const FIRECRAWL_KEY = Deno.env.get("FIRECRAWL_API_KEY");

if (!ANTHROPIC_KEY || !FIRECRAWL_KEY) {
  console.error("ERROR: API Keys missing in .env file");
  Deno.exit(1);
}

// Initialize Context
const zypherContext = await createZypherContext(Deno.cwd());

// Initialize Global Agent Instance (Preserves context for Q&A)
const agent = new ZypherAgent(
  zypherContext,
  new AnthropicModelProvider({ apiKey: ANTHROPIC_KEY }),
);

// Register Firecrawl Tool
await agent.mcp.registerServer({
  id: "firecrawl",
  type: "command",
  command: {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: { FIRECRAWL_API_KEY: FIRECRAWL_KEY },
  },
});

// ==========================================
// 2. Frontend HTML Template (Professional Q&A UI)
// ==========================================
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zypher Research System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        .markdown-body h1 { font-size: 1.8em; font-weight: bold; margin-top: 1em; color: #1e3a8a; }
        .markdown-body h2 { font-size: 1.4em; font-weight: bold; margin-top: 1em; color: #1d4ed8; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-body li { margin-bottom: 0.5em; }
        .markdown-body p { margin-bottom: 1em; line-height: 1.6; color: #374151; }
        .markdown-body strong { color: #111827; font-weight: 700; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col items-center py-12 font-sans">

    <div class="w-full max-w-4xl px-6">
        <div class="text-center mb-10">
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Zypher <span class="text-blue-600">Research System</span></h1>
            <p class="mt-3 text-slate-600 text-lg">Autonomous Analysis • Claude 4 Sonnet</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
            <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Research Target</label>
            <div class="flex gap-3 flex-col sm:flex-row">
                <input type="text" id="inputUrl" 
                    placeholder="Paste paper URL or research topic..." 
                    class="flex-1 block w-full rounded-xl border-slate-300 border-2 px-5 py-4 focus:border-blue-500 focus:ring-blue-500 outline-none text-lg"
                >
                <button onclick="runAnalysis()" id="btnAnalyze"
                    class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg disabled:opacity-70">
                    <span>Analyze</span>
                </button>
            </div>
        </div>

        <div id="loader" class="hidden text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
            <p class="text-slate-800 font-medium text-lg animate-pulse">Processing Request...</p>
        </div>

        <div id="resultCard" class="hidden bg-white rounded-2xl shadow-xl p-10 border border-slate-200 mb-8">
            <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
                <h2 class="text-2xl font-bold text-slate-800">Analysis Report</h2>
                <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Completed</span>
            </div>
            <div id="outputContent" class="markdown-body"></div>
        </div>

        <div id="qaSection" class="hidden bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h3 class="text-xl font-bold text-slate-800 mb-4">Follow-up Q&A</h3>
            
            <div id="chatHistory" class="space-y-4 mb-6 max-h-96 overflow-y-auto"></div>

            <div class="flex gap-3">
                <input type="text" id="inputQuestion" 
                    placeholder="Ask a question about the research..." 
                    class="flex-1 rounded-lg border-slate-300 border px-4 py-3 focus:border-blue-500 outline-none"
                    onkeypress="if(event.key === 'Enter') askQuestion()"
                >
                <button onclick="askQuestion()" id="btnAsk"
                    class="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 transition-all disabled:opacity-70">
                    Ask
                </button>
            </div>
        </div>

    </div>

    <script>
        // 1. Run Initial Analysis
        async function runAnalysis() {
            const input = document.getElementById('inputUrl').value;
            if (!input) return alert("Please enter a URL or Topic");

            const btn = document.getElementById('btnAnalyze');
            btn.disabled = true;
            btn.innerHTML = 'Processing...';
            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('resultCard').classList.add('hidden');
            document.getElementById('qaSection').classList.add('hidden');

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: input })
                });
                const data = await response.json();
                
                document.getElementById('outputContent').innerHTML = marked.parse(data.result);
                document.getElementById('resultCard').classList.remove('hidden');
                
                // Show Q&A Section after analysis
                document.getElementById('qaSection').classList.remove('hidden');
                document.getElementById('chatHistory').innerHTML = ''; // Clear old chat
            } catch (error) {
                alert("System Error: " + error.message);
            } finally {
                document.getElementById('loader').classList.add('hidden');
                btn.disabled = false;
                btn.innerHTML = 'Analyze';
            }
        }

        // 2. Handle Follow-up Questions
        async function askQuestion() {
            const inputEl = document.getElementById('inputQuestion');
            const question = inputEl.value;
            if (!question) return;

            // UI Update: Add User Question
            const chatHistory = document.getElementById('chatHistory');
            chatHistory.innerHTML += \`
                <div class="flex justify-end">
                    <div class="bg-blue-50 text-blue-900 px-4 py-2 rounded-lg rounded-tr-none max-w-[80%]">
                        <strong>You:</strong> \${question}
                    </div>
                </div>\`;
            
            inputEl.value = '';
            inputEl.disabled = true;
            document.getElementById('btnAsk').disabled = true;
            document.getElementById('btnAsk').innerText = '...';

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: question })
                });
                const data = await response.json();

                // UI Update: Add AI Answer
                chatHistory.innerHTML += \`
                    <div class="flex justify-start">
                        <div class="bg-slate-50 text-slate-800 px-4 py-2 rounded-lg rounded-tl-none max-w-[90%] border border-slate-100">
                            <strong>AI:</strong> \${marked.parse(data.result)}
                        </div>
                    </div>\`;
                
                // Scroll to bottom
                chatHistory.scrollTop = chatHistory.scrollHeight;

            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                inputEl.disabled = false;
                inputEl.focus();
                document.getElementById('btnAsk').disabled = false;
                document.getElementById('btnAsk').innerText = 'Ask';
            }
        }
    </script>
</body>
</html>
`;

// ==========================================
// 3. Server Logic
// ==========================================

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  // Route: Frontend
  if (req.method === "GET" && url.pathname === "/") {
    return new Response(htmlContent, {
      headers: { "content-type": "text/html" },
    });
  }

  // Route: Initial Analysis
  if (req.method === "POST" && url.pathname === "/api/analyze") {
    try {
      const { prompt } = await req.json();
      console.log(`\n[Server] New Analysis Task: ${prompt}`);

      const fullTask = `Act as a Senior Researcher. 
      Task: Read/Search regarding "${prompt}". 
      If it is a URL, use Firecrawl to read it.
      Output a structured report with: 1. Innovation Summary, 2. Key Limitations, 3. Future Directions.`;

      const event$ = agent.runTask(fullTask, "claude-sonnet-4-20250514");
      let fullText = await collectStream(event$);
      
      console.log("[Server] Analysis Completed.");
      return Response.json({ result: fullText });
    } catch (error) {
      console.error(error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  // Route: Follow-up Chat
  if (req.method === "POST" && url.pathname === "/api/chat") {
    try {
      const { question } = await req.json();
      console.log(`\n[Server] Follow-up Question: ${question}`);

      // The agent instance is persistent, so it may retain some context,
      // but explicit prompting ensures it knows this is a follow-up.
      const fullTask = `Regarding the research topic/paper you just analyzed, answer this user question: "${question}". Keep the answer concise and technical.`;

      const event$ = agent.runTask(fullTask, "claude-sonnet-4-20250514");
      let fullText = await collectStream(event$);

      console.log("[Server] Answer Sent.");
      return Response.json({ result: fullText });
    } catch (error) {
      console.error(error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});

// Helper to collect stream data
async function collectStream(event$: any): Promise<string> {
  let fullText = "";
  for await (const event of eachValueFrom(event$)) {
    Deno.stdout.write(new TextEncoder().encode(".")); 
    if (event && event.type === "text" && event.content) {
       fullText += event.content;
    }
  }
  if (!fullText) fullText = "Task completed (check logs for details).";
  return fullText;
}