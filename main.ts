import {
  AnthropicModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "npm:rxjs-for-await";
import "https://deno.land/std@0.211.0/dotenv/load.ts";

// 1. Check API Keys
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

if (!anthropicKey || !firecrawlKey) {
  console.error("ERROR: Missing API Keys in .env file.");
  Deno.exit(1);
}

// 2. Initialize Context
const zypherContext = await createZypherContext(Deno.cwd());

// 3. Create Agent
const agent = new ZypherAgent(
  zypherContext,
  new AnthropicModelProvider({
    apiKey: anthropicKey,
  }),
);

// 4. Register Tools
await agent.mcp.registerServer({
  id: "firecrawl",
  type: "command",
  command: {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: {
      FIRECRAWL_API_KEY: firecrawlKey,
    },
  },
});

// 5. Professional UI Header
console.log("--------------------------------------------------");
console.log("ZYPHER RESEARCH SYSTEM [v2.0.0]");
console.log("System Status: ONLINE");
console.log("Model Connected: claude-sonnet-4-20250514"); 
console.log("--------------------------------------------------");
console.log("Type your research command below (or 'exit' to quit).");

// 6. Custom Loop
while (true) {
  const input = prompt("\nresearcher@zypher:~$");

  if (!input || input.trim().toLowerCase() === "exit") {
    console.log("System shutting down...");
    break;
  }

  console.log("[Processing Request...]");

  try {

    const event$ = agent.runTask(input, "claude-sonnet-4-20250514");

    for await (const event of eachValueFrom(event$)) {
      console.log(event);
    }
  } catch (error) {
    console.error("[System Error]", error);
  }
  
  console.log("\n[Ready]");
}