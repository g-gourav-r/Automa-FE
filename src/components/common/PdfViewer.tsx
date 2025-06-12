import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // For panning
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft ?? 0);
    startY.current = e.pageY - (containerRef.current?.offsetTop ?? 0);
    scrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    scrollTop.current = containerRef.current?.scrollTop ?? 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = startX.current - x;
    const walkY = startY.current - y;
    containerRef.current.scrollLeft = scrollLeft.current + walkX;
    containerRef.current.scrollTop = scrollTop.current + walkY;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  function zoomOut(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setScale((prev) => Math.max(0.25, prev - 0.1));
  }
  function zoomIn(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setScale((prev) => Math.min(3, prev + 0.1));
  }
  function resetZoom(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setScale(1);
  }
  return (
    <div className="h-[83vh] flex flex-col overflow-hidden">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 rounded border border-purple-200">
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-purple-400 text-white rounded hover:bg-purple-600 transition"
        >
          −
        </button>
        <span className="text-purple-600 font-medium">
          Zoom: {(scale * 100).toFixed(0)}%
        </span>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-purple-400 text-white rounded hover:bg-purple-600 transition"
        >
          ＋
        </button>
        <button
          onClick={resetZoom}
          className="ml-auto px-3 py-1 bg-gray-100 text-purple-600 rounded hover:bg-gray-200 transition"
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto flex-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth * scale}
              className="mb-4"
            />
          ))}
        </Document>
      </div>
    </div>
  );
};
