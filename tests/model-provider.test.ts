import { describe, expect, it, vi } from "vitest";
import {
  createCompatibleModelProvider,
  createProviderConfigFromEnv,
  MissingModelCredentialError
} from "@/lib/ai/model-provider";

describe("model provider config", () => {
  it("reads DashScope-compatible config from environment values", () => {
    const config = createProviderConfigFromEnv({
      DASHSCOPE_API_KEY: "test-key",
      DASHSCOPE_BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      DASHSCOPE_MODEL: "qwen3.6-27b"
    });

    expect(config).toEqual({
      apiKey: "test-key",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: "qwen3.6-27b",
      responseFormat: undefined
    });
  });

  it("enables JSON mode only when explicitly configured", () => {
    const config = createProviderConfigFromEnv({
      DASHSCOPE_API_KEY: "test-key",
      DASHSCOPE_RESPONSE_FORMAT: "json_object"
    });

    expect(config.responseFormat).toEqual({ type: "json_object" });
  });

  it("throws a safe credential error when no API key is configured", () => {
    expect(() =>
      createProviderConfigFromEnv({
        DASHSCOPE_BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        DASHSCOPE_MODEL: "qwen3.6-27b"
      })
    ).toThrow(MissingModelCredentialError);
  });
});

describe("createCompatibleModelProvider", () => {
  it("posts OpenAI-compatible chat completions and extracts JSON content", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ title: "短剧强钩子版", source_refs: ["chapter_1:p_001"] })
            }
          }
        ]
      }),
      text: async () => ""
    }));
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "test-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b"
      },
      fetcher: fetchMock
    });

    const output = await provider.generateJson({
      system: "Return JSON.",
      user: "Generate one direction."
    });

    expect(output).toEqual({ title: "短剧强钩子版", source_refs: ["chapter_1:p_001"] });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json"
        }),
        body: expect.stringContaining("qwen3.6-27b")
      })
    );
    expect(getRequestBody(fetchMock)).not.toHaveProperty("response_format");
  });

  it("passes response_format when JSON mode is configured", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ ok: true })
            }
          }
        ]
      }),
      text: async () => ""
    }));
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "test-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b",
        responseFormat: { type: "json_object" }
      },
      fetcher: fetchMock
    });

    await provider.generateJson({ system: "Return JSON.", user: "Hi" });

    expect(getRequestBody(fetchMock)).toHaveProperty("response_format", {
      type: "json_object"
    });
  });

  it("allows callers to cap max tokens per generation step", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ ok: true })
            }
          }
        ]
      }),
      text: async () => ""
    }));
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "test-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b"
      },
      fetcher: fetchMock
    });

    await provider.generateJson({ system: "Return JSON.", user: "Hi", maxTokens: 800 });

    expect(getRequestBody(fetchMock)).toHaveProperty("max_tokens", 800);
  });

  it("reports provider errors without leaking the API key", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => "bad key"
    }));
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "secret-value",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b"
      },
      fetcher: fetchMock
    });

    await expect(provider.generateJson({ system: "Return JSON.", user: "Hi" })).rejects.toThrow(
      "Model request failed with status 401"
    );
    await expect(provider.generateJson({ system: "Return JSON.", user: "Hi" })).rejects.not.toThrow(
      "secret-value"
    );
  });

  it("parses JSON content that is double encoded as a string", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(
                JSON.stringify([{ title: "二次编码方向", source_refs: ["chapter_1:p_001"] }])
              )
            }
          }
        ]
      }),
      text: async () => ""
    }));
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "test-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b"
      },
      fetcher: fetchMock
    });

    await expect(provider.generateJson({ system: "Return JSON.", user: "Hi" })).resolves.toEqual([
      { title: "二次编码方向", source_refs: ["chapter_1:p_001"] }
    ]);
  });

  it("passes an abort signal to provider requests", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(init.signal).toBeDefined();

      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ ok: true })
              }
            }
          ]
        }),
        text: async () => ""
      };
    });
    const provider = createCompatibleModelProvider({
      config: {
        apiKey: "test-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: "qwen3.6-27b"
      },
      fetcher: fetchMock,
      timeoutMs: 1000
    });

    await expect(provider.generateJson({ system: "Return JSON.", user: "Hi" })).resolves.toEqual({ ok: true });
  });
});

function getRequestBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;

  if (typeof init?.body !== "string") {
    throw new Error("Expected fetch mock to receive a JSON request body.");
  }

  return JSON.parse(init.body) as Record<string, unknown>;
}
