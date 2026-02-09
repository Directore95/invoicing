export async function exportInvoicePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found in DOM`);

  // Import libraries individually with robust module resolution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jsPDF: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let html2canvas: any;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('jspdf') as any;
    jsPDF = mod.default ?? mod.jsPDF ?? mod;
    if (typeof jsPDF !== 'function') {
      throw new Error('jsPDF constructor not found. Module keys: ' + Object.keys(mod).join(', '));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to load jsPDF library: ${msg}`);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('html2canvas') as any;
    html2canvas = mod.default ?? mod;
    if (typeof html2canvas !== 'function') {
      throw new Error('html2canvas function not found. Module keys: ' + Object.keys(mod).join(', '));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to load html2canvas library: ${msg}`);
  }

  // Wait for any images (QR codes, logos, signatures) to finish loading
  const images = element.querySelectorAll('img');
  if (images.length > 0) {
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight > 0) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 3000);
          })
      )
    );
  }

  // Brief delay for async-rendered content (QR codes via useEffect)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Render the element to canvas
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`html2canvas rendering failed: ${msg}`);
  }

  // Generate PDF from canvas
  try {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let position = 0;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pdfHeight;
        position -= pdfHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(filename);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PDF generation/save failed: ${msg}`);
  }
}

/**
 * Print the invoice using the browser's native print dialog.
 * Users can choose "Save as PDF" from the print dialog.
 */
export function printInvoice(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  // Collect all stylesheets from the current page
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Invoice</title>
      ${styles}
      <style>
        body { margin: 0; padding: 0; background: white; }
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
