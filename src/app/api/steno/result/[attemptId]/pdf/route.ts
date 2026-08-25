import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import StenoResult from "@/models/StenoResult";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { StenoResultPdfDocument } from "@/components/steno/StenoResultPdfDocument";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let resultDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(attemptId)) {
      resultDoc = await StenoResult.findById(attemptId)
        .populate("passageId")
        .populate("examId")
        .populate("userId", "name email image role")
        .lean();
    }

    if (!resultDoc) {
      return NextResponse.json({ error: "Result record not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const isOwner = (resultDoc.userId as any)?._id?.toString() === session.user.id;
    const isStaff = ["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER", "TYPING_ADMIN"].includes(userRole);

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Access Denied: You can only download your own test results." },
        { status: 403 }
      );
    }

    const docElement = React.createElement(StenoResultPdfDocument, { result: JSON.parse(JSON.stringify(resultDoc)) });
    const pdfStream = await pdf(docElement as any).toBuffer();

    const studentNameSanitized = ((resultDoc.userId as any)?.name || "Student").replace(/[^a-zA-Z0-9]/g, "_");
    const testTitleSanitized = (resultDoc.passageTitle || "Test").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `NGIT_Steno_Result_${testTitleSanitized}_${studentNameSanitized}.pdf`;

    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Steno PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate Steno PDF report" }, { status: 500 });
  }
}
