import { useRef } from "react";
import type { DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";

interface Props {
  images: { file: File; base64: string; mimeType: string }[];
  onAddImages: (images: { file: File; base64: string; mimeType: string }[]) => void;
  onRemoveImage: (index: number) => void;
}

export function ImageUploader({ images, onAddImages, onRemoveImage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Str = e.target?.result as string;
        const b64 = base64Str.split(",")[1];
        onAddImages([{ file, base64: b64, mimeType: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Solte imagens ou clique para colar</p>
        <p className="text-xs text-muted-foreground">RX, Ressonâncias ou Lâminas</p>
        <input 
          ref={fileRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
              <img src={`data:${img.mimeType};base64,${img.base64}`} alt="..." className="w-full h-16 object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveImage(idx); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
