import jsPDF from 'jspdf';

export async function exportInvoicePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  // Dynamic import - html2canvas requires browser APIs
  const { default: html2canvas } = await import('html2canvas');

  // Wait for any images (QR codes, logos) to finish loading
  const images = element.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // Timeout after 3s in case image never loads
          setTimeout(resolve, 3000);
        })
    )
  );

  // Brief delay for any async rendering (QR code generation, etc.)
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 5000,
    windowWidth: 794, // A4 width in px at 96dpi
    onclone: (clonedDoc: Document) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.width = '794px';
        clonedEl.style.maxWidth = '794px';
        clonedEl.style.padding = '32px';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Scale image to fit page width
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // Handle multi-page if content is taller than one page
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
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
