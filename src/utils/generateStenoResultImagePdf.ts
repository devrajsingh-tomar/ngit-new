import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface GenerateStenoResultPdfOptions {
  elementId?: string;
  element?: HTMLElement;
  filename?: string;
  candidateName?: string;
  testTitle?: string;
}

export async function generateStenoResultImagePdf({
  elementId = "steno-result-printable-area",
  element,
  filename,
  candidateName = "Student",
  testTitle = "Steno Test",
}: GenerateStenoResultPdfOptions): Promise<void> {
  const targetElement = element || document.getElementById(elementId);
  if (!targetElement) {
    throw new Error("Result report printable area not found!");
  }

  // 1. Capture HTML into high-res canvas (scale: 2 for retina-crisp Hindi text & icons)
  const canvas = await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: "#ffffff",
    windowWidth: 1280, // standardized desktop width for consistent layout
  });

  // 2. Initialize A4 PDF (210mm x 297mm)
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Margin and header/footer bounds
  const marginTop = 22; // space for header
  const marginBottom = 15; // space for footer
  const marginX = 8;
  const printableWidth = pdfWidth - marginX * 2;
  const printableHeight = pdfHeight - marginTop - marginBottom;

  const imgWidth = printableWidth;
  const imgHeight = (canvas.height * printableWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  let pageNum = 1;
  const totalPages = Math.ceil(imgHeight / printableHeight) || 1;

  // Helper to draw Header & Footer on each page
  const drawHeaderFooter = (page: number) => {
    // --- TOP HEADER ---
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pdfWidth, 16, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text("NGIT INSTITUTE", marginX, 6.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(199, 210, 254);
    pdf.text("OFFICIAL STENO EXAMINATION & EVALUATION REPORT", marginX, 11);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Helpline: +91 80049 58441 | Web: ngitedu.com", pdfWidth - marginX, 9, { align: "right" });

    // Decorative Indigo Line
    pdf.setFillColor(79, 70, 229); // indigo-600
    pdf.rect(0, 16, pdfWidth, 1.2, "F");

    // --- BOTTOM FOOTER ---
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pdfHeight - 10, pdfWidth - marginX, pdfHeight - 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString();
    pdf.text(`System Generated Scorecard | Candidate: ${candidateName} | Date: ${dateStr}`, marginX, pdfHeight - 6);
    pdf.text(`Page ${page} of ${totalPages}`, pdfWidth - marginX, pdfHeight - 6, { align: "right" });
  };

  // 3. Slice and Render Canvas into Pages
  while (heightLeft > 0) {
    if (pageNum > 1) {
      pdf.addPage();
    }

    // Draw header and footer
    drawHeaderFooter(pageNum);

    // Calculate source slice from canvas
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    const sliceHeightPx = (printableHeight / printableWidth) * canvas.width;
    sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - position);

    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        position,
        canvas.width,
        sliceCanvas.height,
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
      );

      const sliceImgHeightMm = (sliceCanvas.height * printableWidth) / canvas.width;
      const sliceImgData = sliceCanvas.toDataURL("image/png");
      pdf.addImage(sliceImgData, "PNG", marginX, marginTop, printableWidth, sliceImgHeightMm, undefined, "FAST");
    }

    position += sliceHeightPx;
    heightLeft -= printableHeight;
    pageNum++;
  }

  // 4. Trigger Direct Browser Download
  const cleanFilename =
    filename ||
    `NGIT_Steno_Result_${testTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  pdf.save(cleanFilename);
}
