import { NextResponse } from "next/server";
import { ScreenplayProjectSchema } from "@/lib/domain/schemas";
import { createCompatibleModelProvider, createProviderConfigFromEnv, MissingModelCredentialError } from "@/lib/ai/model-provider";
import { generateBlueprintWithHarness } from "@/lib/harness/generate-blueprint";

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

  const selectedDirection = parsedProject.data.directions.find((direction) => direction.id === body?.directionId);

  if (!selectedDirection) {
    return NextResponse.json(
      {
        error: "Invalid or missing directionId."
      },
      { status: 400 }
    );
  }

  try {
    const config = createProviderConfigFromEnv(process.env);
    const provider = createCompatibleModelProvider({ config, timeoutMs: 120000 });
    const result = await generateBlueprintWithHarness({
      project: parsedProject.data,
      selectedDirection,
      provider,
      model: config.model
    });

    if (!result.sceneBlueprint) {
      return NextResponse.json(
        {
          error: result.run.error ?? "Blueprint generation failed.",
          run: result.run
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      scene_blueprint: result.sceneBlueprint,
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
        error: error instanceof Error ? error.message : "Unknown blueprint generation error."
      },
      { status: 502 }
    );
  }
}
