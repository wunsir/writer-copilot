import { NextResponse } from "next/server";
import { ScreenplayProjectSchema } from "@/lib/domain/schemas";
import { createCompatibleModelProvider, createProviderConfigFromEnv, MissingModelCredentialError } from "@/lib/ai/model-provider";
import { generateDirectionsWithHarness } from "@/lib/harness/generate-directions";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedProject = ScreenplayProjectSchema.safeParse(body?.project);

  if (!parsedProject.success) {
    return NextResponse.json(
      {
        error: "Invalid screenplay project payload."
      },
      { status: 400 }
    );
  }

  try {
    const config = createProviderConfigFromEnv(process.env);
    const provider = createCompatibleModelProvider({ config });
    const result = await generateDirectionsWithHarness({
      project: parsedProject.data,
      provider,
      model: config.model
    });

    if (!result.directions) {
      return NextResponse.json(
        {
          error: result.run.error ?? "Direction generation failed.",
          run: result.run
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      directions: result.directions,
      run: result.run
    });
  } catch (error) {
    if (error instanceof MissingModelCredentialError) {
      return NextResponse.json(
        {
          error: error.message
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown direction generation error."
      },
      { status: 502 }
    );
  }
}
