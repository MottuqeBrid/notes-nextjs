// import { saveDeviceData } from "@/lib/saveDeviceData";
// import { createClient } from "@supabase/supabase-js";
// import { NextRequest, NextResponse } from "next/server";

// async function getSupabaseClient() {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//   if (!supabaseUrl || !serviceRoleKey) {
//     throw new Error(
//       "Supabase credentials are not defined. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
//     );
//   }

//   return createClient(supabaseUrl, serviceRoleKey);
// }

// const CORS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function GET(request: NextRequest) {
//   // Authorization check
//   // const authHeader = request.headers.get("authorization");
//   // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//   //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   // }

//   try {
//     const supabase = await getSupabaseClient();

//     // যেকোনো ছোট query চালাও
//     const { error, data } = await supabase
//       .from("test") // যেকোনো একটা table নাম দাও
//       .select("id")
//       .limit(1);

//     if (error) throw error;
//     await saveDeviceData(request, null, [
//       "keep-alive",
//       "GET",
//       JSON.stringify(data),
//     ]);

//     return Response.json({
//       success: true,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     return NextResponse.json({ success: false, error }, { status: 500 });
//   }
// }

import { saveDeviceData } from "@/lib/saveDeviceData";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase credentials are not defined. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const { error, data } = await supabase.from("test").select("id").limit(1);

    if (error) throw error;
    await saveDeviceData(request, null, [
      "keep-alive",
      "GET",
      JSON.stringify(data),
    ]);

    return NextResponse.json(
      { success: true, timestamp: new Date().toISOString() },
      { headers: CORS },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error },
      { status: 500, headers: CORS },
    );
  }
}
