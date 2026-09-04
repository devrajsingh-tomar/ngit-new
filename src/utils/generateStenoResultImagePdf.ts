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

  // Dynamic runtime imports
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const { jsPDF } = await import("jspdf");

  // Inject temporary style to hide scrollbars during canvas capture
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-steno-pdf-style", "true");
  styleEl.innerHTML = `
    #${elementId} ::-webkit-scrollbar,
    #${elementId} *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  `;
  document.head.appendChild(styleEl);

  // Save current scroll position and scroll window to (0,0) so html2canvas captures top of document accurately
  const origScrollX = window.scrollX;
  const origScrollY = window.scrollY;
  window.scrollTo(0, 0);

  // Allow DOM to settle at (0,0)
  await new Promise((resolve) => setTimeout(resolve, 100));

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: targetElement.offsetWidth || 1280,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.animation = "none";
          clonedElement.style.transition = "none";
          clonedElement.style.transform = "none";
          clonedElement.style.opacity = "1";

          const animNodes = clonedElement.querySelectorAll(".animate-in, .fade-in, [class*='duration-']");
          animNodes.forEach((node: any) => {
            node.classList.remove("animate-in", "fade-in");
            node.style.animation = "none";
            node.style.transition = "none";
            node.style.opacity = "1";
          });
        }
      },
    });
  } finally {
    // Restore user scroll position
    window.scrollTo(origScrollX, origScrollY);
    if (styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Canvas rendering failed or produced empty image.");
  }

  // Initialize A4 PDF (210mm x 297mm)
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Margin and header/footer bounds
  const marginTop = 22; // space for header
  const marginBottom = 15; // space for footer
  const marginX = 8;
  const printableWidth = pdfWidth - marginX * 2; // 194 mm
  const printableHeight = pdfHeight - marginTop - marginBottom; // 260 mm

  // Height of one full page slice in canvas pixels
  const sliceHeightPx = (printableHeight / printableWidth) * canvas.width;
  // Total pages strictly based on exact content height
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

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

  // Slice and Render Canvas into Pages
  let positionPx = 0;
  let pageNum = 1;

  while (positionPx < canvas.height - 5) {
    if (pageNum > 1) {
      pdf.addPage();
    }

    // Draw header and footer
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

  // Trigger Direct Browser Download
  const cleanFilename =
    filename ||
    `NGIT_Steno_Result_${testTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  pdf.save(cleanFilename);
}
