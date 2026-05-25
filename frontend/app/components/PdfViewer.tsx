import React, { useState, useEffect } from 'react';

/**
 * PdfViewer – simple wrapper around pdf.js to render the uploaded PDF.
 * Props:
 *   file: File object (PDF) passed from the parent.
 *   onLoad: callback receiving number of pages once PDF is ready.
 */
export default function PdfViewer({ file, onLoad }) {
  const [pdf, setPdf] = useState(null);

  useEffect(() => {
    if (!file) return;
    const loadPdf = async () => {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdf(loadedPdf);
      onLoad && onLoad(loadedPdf.numPages);
    };
    loadPdf();
  }, [file]);

  if (!pdf) return <p>Loading PDF…</p>;

  // Render each page as canvas
  return (
    <div className="pdf-viewer">
      {[...Array(pdf.numPages)].map((_, i) => (
        <PageCanvas key={i} pdf={pdf} pageNumber={i + 1} />
      ))}
    </div>
  );
}

function PageCanvas({ pdf, pageNumber }) {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    };
    renderPage();
  }, [pdf, pageNumber]);

  return <canvas ref={canvasRef} style={{ marginBottom: '1rem' }} />;
}
