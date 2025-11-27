"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageInputProps {
  onGenerate: (base64: string) => void;
  isLoading: boolean;
}

export function ImageInput({ onGenerate, isLoading }: ImageInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Image size should be less than 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = () => {
    if (imagePreview) {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = imagePreview.split(",")[1];
        onGenerate(base64Data);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">From Image</h2>
        <p className="text-muted-foreground">
          Upload an image to generate a similar prompt structure.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 hover:bg-muted/50 transition-colors cursor-pointer relative"
             onClick={() => fileInputRef.current?.click()}>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />

          {imagePreview ? (
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-[400px] w-auto object-contain rounded-md" 
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full"
                onClick={handleRemoveImage}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !imagePreview}
          size="lg"
        >
          {isLoading ? "Generating..." : "Make Prompt"}
        </Button>
      </div>
    </div>
  );
}




