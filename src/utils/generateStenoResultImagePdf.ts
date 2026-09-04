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

  // 1. Diagnostics logging before capture
  const rect = targetElement.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(targetElement);

  if (DEBUG) {
    console.log("=== STENO PDF DIAGNOSTICS (BEFORE CAPTURE) ===");
    console.log("Target Element:", targetElement);
    console.log("Target innerHTML Length:", targetElement.innerHTML.length);
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
      overflow: computedStyle.overflow,
      maxHeight: computedStyle.maxHeight,
      height: computedStyle.height,
      transform: computedStyle.transform,
    });
  }

  // Strict Validation: prevent silent generation if content is empty or missing
  if (rect.width === 0 || rect.height === 0 || targetElement.offsetWidth === 0 || targetElement.offsetHeight === 0) {
    throw new Error("Result report printable area has no rendered content.");
  }

  // Dynamic runtime imports
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const { jsPDF } = await import("jspdf");

  // Save current scroll position
  const origScrollX = window.scrollX;
  const origScrollY = window.scrollY;

  // 2. Off-Screen Isolated Container Approach
  // This bypasses parent scroll containers (e.g. StudentLayout's overflow-y-auto / h-screen)
  const offscreenContainer = document.createElement("div");
  offscreenContainer.id = "steno-pdf-offscreen-container";
  offscreenContainer.style.position = "fixed";
  offscreenContainer.style.left = "0";
  offscreenContainer.style.top = "0";
  offscreenContainer.style.width = "850px"; // Controlled A4-suitable width (approx 850px at 96 DPI)
  offscreenContainer.style.backgroundColor = "#ffffff";
  offscreenContainer.style.zIndex = "-99999";
  offscreenContainer.style.pointerEvents = "none";
  offscreenContainer.style.overflow = "visible";

  // Clone target element
  const clone = targetElement.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-pdf-clone`;
  clone.style.width = "100%";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.padding = "24px";
  clone.style.backgroundColor = "#f8fafc";

  // Remove interactive / ignore elements from clone
  const ignoreEls = clone.querySelectorAll('[data-html2canvas-ignore="true"], .ignore-pdf');
  ignoreEls.forEach((el) => el.remove());

  // Remove scroll restrictions and fixed height traps from all nested elements in clone
  const allNodes = clone.querySelectorAll("*");
  allNodes.forEach((node) => {
    const el = node as HTMLElement;
    if (el.style) {
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
      el.style.animation = "none";
      el.style.transition = "none";
    }
    if (el.classList) {
      el.classList.remove(
        "overflow-y-auto",
        "overflow-x-auto",
        "overflow-hidden",
        "h-screen",
        "animate-in",
        "fade-in"
      );
      el.classList.add("overflow-visible");
    }
  });

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  let canvas: HTMLCanvasElement;

  try {
    // Wait for fonts and layout stabilization
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Capture offscreen clone with html2canvas
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: clone.offsetWidth || 850,
      height: clone.scrollHeight || clone.offsetHeight,
      windowWidth: 850,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    // Clean up offscreen container
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
    window.scrollTo(origScrollX, origScrollY);
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Canvas rendering failed or produced empty image.");
  }

  // 3. Initialize A4 PDF (210mm x 297mm)
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Header & Footer margins (mm)
  const marginTop = 20; // top margin for content below header
  const marginBottom = 14; // bottom margin for content above footer
  const marginX = 8; // left/right margin
  const printableWidth = pdfWidth - marginX * 2; // 194 mm
  const printableHeight = pdfHeight - marginTop - marginBottom; // 263 mm

  // Height of one A4 page slice in canvas pixels
  const sliceHeightPx = (printableHeight / printableWidth) * canvas.width;

  // Total pages strictly based on exact content height
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

  if (DEBUG) {
    console.log("=== STENO PDF DIAGNOSTICS (AFTER CAPTURE) ===");
    console.log("Canvas Width (px):", canvas.width);
    console.log("Canvas Height (px):", canvas.height);
    console.log("PDF Printable Width (mm):", printableWidth);
    console.log("PDF Printable Height (mm):", printableHeight);
    console.log("Slice Height (px):", sliceHeightPx);
    console.log("Calculated Number of Pages:", totalPages);
  }

  // Helper to draw Header & Footer on each page
  const drawHeaderFooter = (page: number) => {
    // --- TOP HEADER ---
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pdfWidth, 15, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text("NGIT INSTITUTE", marginX, 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(199, 210, 254); // indigo-200
    pdf.text("OFFICIAL STENO EXAMINATION & EVALUATION REPORT", marginX, 10.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Helpline: +91 80049 58441 | Web: ngitedu.com", pdfWidth - marginX, 8.5, { align: "right" });

    // Decorative Indigo Line
    pdf.setFillColor(79, 70, 229); // indigo-600
    pdf.rect(0, 15, pdfWidth, 1.2, "F");

    // --- BOTTOM FOOTER ---
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pdfHeight - 9, pdfWidth - marginX, pdfHeight - 9);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139); // slate-500
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

  // Trigger Direct Download
  const cleanFilename =
    filename ||
    `NGIT_Steno_Result_${testTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  pdf.save(cleanFilename);
}
