import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReconciliationResultSchema } from "@/lib/schemas";
import { generateDossierPDF } from "@/lib/documents/dossierGenerator";

const DossierRequestSchema = z.object({
  result: ReconciliationResultSchema,
  lang: z.enum(["en", "hi"]).optional().default("en")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DossierRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid dossier request payload.",
          details: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`)
        },
        { status: 400 }
      );
    }

    const { result, lang } = parsed.data;
    const pdfBuffer = generateDossierPDF(result, lang);

    const filename =
      lang === "hi"
        ? "ClaimClarity-Evidence-Dossier-HI.pdf"
        : "ClaimClarity-Evidence-Dossier.pdf";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (err: unknown) {
    console.error("[Dossier Generator Error]", err);
    return NextResponse.json(
      { error: "We could not prepare the document right now. Please try again." },
      { status: 500 }
    );
  }
}
