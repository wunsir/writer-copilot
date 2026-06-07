import { NextResponse } from "next/server";
import { ScreenplayProjectSchema } from "@/lib/domain/schemas";
import { createCompatibleModelProvider, createProviderConfigFromEnv, MissingModelCredentialError } from "@/lib/ai/model-provider";
import { generateDiagnosisWithHarness } from "@/lib/harness/generate-diagnosis";

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
    const result = await generateDiagnosisWithHarness({
      project: parsedProject.data,
      provider,
      model: config.model
    });

    if (!result.diagnosis) {
      return NextResponse.json(
        {
          error: result.run.error ?? "Diagnosis generation failed.",
          run: result.run
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      diagnosis: result.diagnosis,
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
        error: error instanceof Error ? error.message : "Unknown diagnosis generation error."
      },
      { status: 502 }
    );
  }
}
