import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (PDF only for now)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Read file buffer once — used for both text extraction and Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF for knowledge base indexing
    let extractedText = "";
    try {
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text.trim();
    } catch (parseError) {
      console.warn("PDF text extraction failed (may be a scanned PDF):", parseError);
      // Continue anyway — the file is still uploaded, just without extracted text
    }

    // Generate unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `knowledge-base/${fileName}`;

    // Upload to Supabase Storage (reconstruct File from buffer to avoid consumed stream)
    const uploadFile = new File([fileBuffer], file.name, { type: file.type });
    const { error } = await supabase.storage
      .from("knowledge-base")
      .upload(filePath, uploadFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("knowledge-base").getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      path: filePath,
      extractedText,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
