import { NextRequest, NextResponse } from "next/server";
import { getCampaign, updateCampaign } from "@/lib/server/airtable";
import { env } from "@/lib/server/env";
import type { Campaign } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  if (!env.airtable.baseId()) {
    return NextResponse.json({ error: "Airtable not configured" }, { status: 503 });
  }
  try {
    const campaign = await getCampaign(id);
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (e) {
    console.error("[/api/campaigns/[id] GET]", e);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  if (!env.airtable.baseId()) {
    return NextResponse.json({ ok: true, note: "mock mode — change not persisted" });
  }
  let body: Partial<Campaign>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    await updateCampaign(id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/campaigns/[id] PATCH]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
