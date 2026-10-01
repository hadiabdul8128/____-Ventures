import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const isShadcn = process.argv.includes("--shadcn");
const args = process.argv.slice(2).filter((arg) => arg !== "--shadcn");
const client = new Client({ name: "ventures-design-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: isShadcn
    ? ["node_modules/shadcn/dist/index.js", "mcp"]
    : ["node_modules/@magicuidesign/mcp/dist/server.js"],
});
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  if (args[0]) {
    const result = await client.callTool({
      name: args[0],
      arguments: JSON.parse(args[1] || "{}"),
    });
    console.log(JSON.stringify(result, null, 2));
  }
} finally {
  await client.close();
}
