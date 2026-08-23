import { NextResponse } from "next/server";
import { seedStenoInstituteAccountAction } from "@/app/actions/steno";

export async function GET() {
  try {
    await seedStenoInstituteAccountAction();
    return NextResponse.json({
      success: true,
      message: "Seeded all module manager accounts (manager@ngitedu.com, stenoinstitute@ngitedu.com, stenomanager@ngitedu.com, typingmanager@ngitedu.com)",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
