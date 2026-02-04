import { NextRequest, NextResponse } from "next/server";
import {
  updateLayerOrder,
  updateCategoryOrder,
  updateTechItemOrder,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { type, updates } = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates must be an array" },
        { status: 400 },
      );
    }

    switch (type) {
      case "layer":
        updateLayerOrder(updates);
        break;
      case "category":
        updateCategoryOrder(updates);
        break;
      case "tech-item":
        updateTechItemOrder(updates);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder failed:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
