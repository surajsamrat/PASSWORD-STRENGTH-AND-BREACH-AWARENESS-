import "dotenv/config";
import { createAssistantApp } from "./app";

const port = Number(process.env.PORT || 8787);
const app = createAssistantApp();

app.listen(port, () => {
  // Never log secrets or API keys
  console.info(`SecureCheck AI backend listening on http://localhost:${port}`);
});
