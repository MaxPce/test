import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  label?: string;
  shape?: "square" | "circle";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function ImageUpload({
  currentImage,
  onImageSelect,
  onImageRemove,
  label = "Subir imagen",
  shape = "square",
  size = "md",
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Notificar al componente padre
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-start gap-4">
        {/* Preview / Placeholder */}
        <div
          className={`${sizeClasses[size]} ${shapeClass} border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Botón de carga */}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar archivo
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, GIF o WebP (max. 5MB)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
