export type ProviderEnv = Partial<Record<string, string | undefined>>;

export type CompatibleModelConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  responseFormat?: { type: "json_object" };
};

export type GenerateJsonInput = {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
};

type Fetcher = (url: string, init: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}>;

export class MissingModelCredentialError extends Error {
  constructor() {
    super("Missing DASHSCOPE_API_KEY. Configure it in ignored local environment variables before running AI generation.");
    this.name = "MissingModelCredentialError";
  }
}

export function createProviderConfigFromEnv(env: ProviderEnv): CompatibleModelConfig {
  const apiKey = env.DASHSCOPE_API_KEY ?? env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new MissingModelCredentialError();
  }

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(
      env.DASHSCOPE_BASE_URL ?? env.OPENAI_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
    ),
    model: env.DASHSCOPE_MODEL ?? env.OPENAI_MODEL ?? "qwen3.6-27b",
    responseFormat: readResponseFormat(env)
  };
}

export function createCompatibleModelProvider({
  config,
  fetcher = fetch,
  timeoutMs = 75000
}: {
  config: CompatibleModelConfig;
  fetcher?: Fetcher;
  timeoutMs?: number;
}) {
  return {
    async generateJson(input: GenerateJsonInput): Promise<unknown> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      let response: Awaited<ReturnType<Fetcher>>;

      const body = {
        model: config.model,
        messages: [
          {
            role: "system",
            content: input.system
          },
          {
            role: "user",
            content: input.user
          }
        ],
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens ?? 1800,
        ...(config.responseFormat ? { response_format: config.responseFormat } : {})
      };

      try {
        response = await fetcher(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error(`Model request timed out after ${timeoutMs}ms.`);
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error(`Model request failed with status ${response.status}: ${await safeResponseText(response)}`);
      }

      const payload = await response.json();
      const content = extractMessageContent(payload);

      return parseJsonContent(content);
    }
  };
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function readResponseFormat(env: ProviderEnv): CompatibleModelConfig["responseFormat"] {
  const configured = env.DASHSCOPE_RESPONSE_FORMAT ?? env.OPENAI_RESPONSE_FORMAT;

  if (configured === "json_object") {
    return { type: "json_object" };
  }

  return undefined;
}

async function safeResponseText(response: { text: () => Promise<string> }): Promise<string> {
  const text = await response.text();

  if (!text.trim()) {
    return "empty response body";
  }

  return text.slice(0, 280);
}

function extractMessageContent(payload: unknown): string {
  if (!isRecord(payload)) {
    throw new Error("Model response was not an object.");
  }

  const choices = payload.choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("Model response did not include choices.");
  }

  const firstChoice = choices[0];

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new Error("Model response did not include a message.");
  }

  const content = firstChoice.message.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Model response message content was empty.");
  }

  return content;
}

function parseJsonContent(content: string): unknown {
  try {
    const parsed = JSON.parse(stripJsonFence(content));

    if (typeof parsed === "string" && looksLikeJson(parsed)) {
      return JSON.parse(stripJsonFence(parsed));
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON from model: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function stripJsonFence(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fenced ? fenced[1].trim() : trimmed;
}

function looksLikeJson(content: string): boolean {
  const trimmed = content.trim();

  return trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("```");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
