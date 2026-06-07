import type { z } from "zod";
import type { HarnessRun } from "@/lib/domain/schemas";

type JsonHarnessStepOptions<T> = {
  id: string;
  step: string;
  model?: string;
  sourceChunksUsed?: string[];
  knowledgePacksUsed?: string[];
  schema: z.ZodType<T>;
  execute: () => Promise<unknown>;
  repair?: (error: Error) => Promise<unknown>;
  now?: () => string;
};

export type JsonHarnessStepResult<T> = {
  run: HarnessRun;
  output?: T;
};

export async function runJsonHarnessStep<T>(
  options: JsonHarnessStepOptions<T>
): Promise<JsonHarnessStepResult<T>> {
  const now = options.now ?? (() => new Date().toISOString());
  const startedAt = now();
  let repairAttempts = 0;

  try {
    const rawOutput = await options.execute();
    const output = parseAndValidate(rawOutput, options.schema);

    return {
      output,
      run: createRun(options, "succeeded", startedAt, now(), repairAttempts)
    };
  } catch (error) {
    const firstError = toError(error);

    if (options.repair) {
      repairAttempts += 1;

      try {
        const repairedOutput = await options.repair(firstError);
        const output = parseAndValidate(repairedOutput, options.schema);

        return {
          output,
          run: createRun(options, "succeeded", startedAt, now(), repairAttempts)
        };
      } catch (repairError) {
        return {
          run: createRun(options, "failed", startedAt, now(), repairAttempts, toError(repairError).message)
        };
      }
    }

    return {
      run: createRun(options, "failed", startedAt, now(), repairAttempts, firstError.message)
    };
  }
}

function parseAndValidate<T>(rawOutput: unknown, schema: z.ZodType<T>): T {
  const parsed = parseJsonOutput(rawOutput);
  const result = schema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Invalid structured output: ${result.error.issues.map((issue) => issue.message).join("; ")}`);
  }

  return result.data;
}

function parseJsonOutput(rawOutput: unknown): unknown {
  if (typeof rawOutput === "string") {
    try {
      return JSON.parse(rawOutput);
    } catch (error) {
      throw new Error(`Invalid JSON: ${toError(error).message}`);
    }
  }

  return rawOutput;
}

function createRun<T>(
  options: JsonHarnessStepOptions<T>,
  status: HarnessRun["status"],
  startedAt: string,
  endedAt: string,
  repairAttempts: number,
  error?: string
): HarnessRun {
  return {
    id: options.id,
    step: options.step,
    status,
    started_at: startedAt,
    ended_at: endedAt,
    model: options.model,
    source_chunks_used: options.sourceChunksUsed ?? [],
    knowledge_packs_used: options.knowledgePacksUsed ?? [],
    repair_attempts: repairAttempts,
    error
  };
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
