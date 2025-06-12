import { ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Props {
  pages: Array<{ page: number; ai_annotated_image_url: string }>;
}

export const TemplatePreview = ({ pages }: Props) => (
  <div className="border h-[70vh] rounded-xl overflow-auto shadow relative">
    <TransformWrapper initialScale={1} wheel={{ step: 0.1 }}>
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <div className="flex space-x-2 p-2 border-b sticky top-0 bg-white z-10">
            <button onClick={() => zoomIn}>
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={() => zoomOut}>
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={() => resetTransform()}>
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
          <TransformComponent>
            <div className="flex flex-col items-center">
              {pages.map((p, idx) => (
                <img
                  key={idx}
                  src={p.ai_annotated_image_url}
                  alt={`Page ${p.page}`}
                  className="mb-4"
                />
              ))}
            </div>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  </div>
);
