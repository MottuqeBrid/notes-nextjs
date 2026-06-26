import { saveDeviceData } from "@/lib/saveDeviceData";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  // Authorization check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // যেকোনো ছোট query চালাও
    const { error, data } = await supabase
      .from("test") // যেকোনো একটা table নাম দাও
      .select("id")
      .limit(1);

    if (error) throw error;
    saveDeviceData(request, null, ["keep-alive", "GET", JSON.stringify(data)]);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
