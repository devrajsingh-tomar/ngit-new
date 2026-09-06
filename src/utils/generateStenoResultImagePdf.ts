export interface GenerateStenoResultPdfOptions {
  elementId?: string;
  element?: HTMLElement;
  filename?: string;
  candidateName?: string;
  testTitle?: string;
}

const DEBUG = true;

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

  // Pre-capture diagnostics
  const rect = targetElement.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(targetElement);

  if (DEBUG) {
    console.log("=== STENO PDF DIAGNOSTICS (BEFORE CAPTURE) ===");
    console.log("Target Element:", targetElement);
    console.log("BoundingClientRect:", rect);
    console.log("Dimensions:", {
      offsetWidth: targetElement.offsetWidth,
      offsetHeight: targetElement.offsetHeight,
      scrollWidth: targetElement.scrollWidth,
      scrollHeight: targetElement.scrollHeight,
    });
    console.log("Computed Styles:", {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
    });
  }

  if (rect.width === 0 || targetElement.offsetWidth === 0) {
    throw new Error("Result report printable area has no rendered content.");
  }

  // Dynamic imports
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const { jsPDF } = await import("jspdf");

  // 1. Temporarily expand max-heights on targetElement scroll boxes for complete capture
  const scrollableNodes = targetElement.querySelectorAll(".max-h-\\[350px\\], .max-h-\\[300px\\], .overflow-y-auto");
  const originalStyles: Array<{ el: HTMLElement; maxHeight: string; overflow: string }> = [];

  scrollableNodes.forEach((node) => {
    const el = node as HTMLElement;
    originalStyles.push({
      el,
      maxHeight: el.style.maxHeight || "",
      overflow: el.style.overflow || "",
    });
    el.style.maxHeight = "none";
    el.style.overflow = "visible";
  });

  // 2. Hide interactive buttons (like Download PDF)
  const ignoreNodes = targetElement.querySelectorAll('[data-html2canvas-ignore="true"], .ignore-pdf');
  const originalDisplays: Array<{ el: HTMLElement; display: string }> = [];

  ignoreNodes.forEach((node) => {
    const el = node as HTMLElement;
    originalDisplays.push({ el, display: el.style.display || "" });
    el.style.display = "none";
  });

  let canvas: HTMLCanvasElement;

  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Capture targetElement directly as rendered on screen
    canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    // Restore original styles and displays on targetElement
    originalStyles.forEach(({ el, maxHeight, overflow }) => {
      el.style.maxHeight = maxHeight;
      el.style.overflow = overflow;
    });
    originalDisplays.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Canvas rendering failed or produced empty image.");
  }

  // 3. Initialize A4 PDF (210mm x 297mm)
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = 210;
  const pdfHeight = 297;

  const marginTop = 20; // top margin in mm
  const marginBottom = 14; // bottom margin in mm
  const marginX = 8; // left/right margin
  const printableWidth = pdfWidth - marginX * 2; // 194 mm
  const printableHeight = pdfHeight - marginTop - marginBottom; // 263 mm

  // Height of one A4 page slice in canvas pixels
  const sliceHeightPx = (printableHeight / printableWidth) * canvas.width;
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

  if (DEBUG) {
    console.log("=== STENO PDF DIAGNOSTICS (AFTER CAPTURE) ===");
    console.log("Canvas Width (px):", canvas.width);
    console.log("Canvas Height (px):", canvas.height);
    console.log("Slice Height (px):", sliceHeightPx);
    console.log("Calculated Number of Pages:", totalPages);
  }

  // Helper to draw Header & Footer on each page
  const drawHeaderFooter = (page: number) => {
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pdfWidth, 15, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("NGIT INSTITUTE", marginX, 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(199, 210, 254);
    pdf.text("OFFICIAL STENO EXAMINATION & EVALUATION REPORT", marginX, 10.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Helpline: +91 80049 58441 | Web: ngitedu.com", pdfWidth - marginX, 8.5, { align: "right" });

    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 15, pdfWidth, 1.2, "F");

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pdfHeight - 9, pdfWidth - marginX, pdfHeight - 9);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString();
    pdf.text(`System Generated Scorecard | Candidate: ${candidateName} | Date: ${dateStr}`, marginX, pdfHeight - 5);
    pdf.text(`Page ${page} of ${totalPages}`, pdfWidth - marginX, pdfHeight - 5, { align: "right" });
  };

  // 4. Slice and Render Canvas into PDF Pages
  let positionPx = 0;
  let pageNum = 1;

  while (positionPx < canvas.height - 5) {
    if (pageNum > 1) {
      pdf.addPage();
    }

    drawHeaderFooter(pageNum);

    const currentSliceHeightPx = Math.min(sliceHeightPx, canvas.height - positionPx);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = currentSliceHeightPx;

    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        positionPx,
        canvas.width,
        currentSliceHeightPx,
        0,
        0,
        sliceCanvas.width,
        currentSliceHeightPx
      );

      const sliceImgHeightMm = (currentSliceHeightPx * printableWidth) / canvas.width;
      const sliceImgData = sliceCanvas.toDataURL("image/png");
      pdf.addImage(sliceImgData, "PNG", marginX, marginTop, printableWidth, sliceImgHeightMm, undefined, "FAST");
    }

    positionPx += sliceHeightPx;
    pageNum++;
  }

  const cleanFilename =
    filename ||
    `NGIT_Steno_Result_${testTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  pdf.save(cleanFilename);
}
