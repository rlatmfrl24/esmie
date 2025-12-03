"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface PromptFormState {
  coreTheme: string;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  aspectRatio: string;
  details: string;
  fullPrompt: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PromptFormProps {
  initialData?: Partial<PromptFormState>;
  onSubmit: (data: PromptFormState) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitError?: string;
}

export function PromptForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitError,
}: PromptFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [, startHydrationTransition] = useTransition();
  const [formData, setFormData] = useState<PromptFormState>({
    coreTheme: "",
    hair: "",
    pose: "",
    outfit: "",
    atmosphere: "",
    gaze: "",
    makeup: "",
    background: "",
    aspectRatio: "",
    details: "",
    fullPrompt: "",
    ...initialData,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (!initialData) return;
    startHydrationTransition(() => {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    });
  }, [initialData, startHydrationTransition]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.coreTheme.trim()) {
      newErrors.coreTheme = "Core Theme은 필수 입력 항목입니다.";
    }
    if (!formData.hair.trim()) {
      newErrors.hair = "Hair는 필수 입력 항목입니다.";
    }
    if (!formData.pose.trim()) {
      newErrors.pose = "Pose는 필수 입력 항목입니다.";
    }
    if (!formData.outfit.trim()) {
      newErrors.outfit = "Outfit은 필수 입력 항목입니다.";
    }
    if (!formData.atmosphere.trim()) {
      newErrors.atmosphere = "Atmosphere는 필수 입력 항목입니다.";
    }
    if (!formData.gaze.trim()) {
      newErrors.gaze = "Gaze는 필수 입력 항목입니다.";
    }
    if (!formData.makeup.trim()) {
      newErrors.makeup = "Makeup은 필수 입력 항목입니다.";
    }
    if (!formData.background.trim()) {
      newErrors.background = "Background는 필수 입력 항목입니다.";
    }
    if (!formData.aspectRatio.trim()) {
      newErrors.aspectRatio = "Aspect Ratio는 필수 선택 항목입니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof PromptFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full min-h-0 font-sans"
    >
      <div className="grid gap-4 overflow-y-auto flex-1 min-h-0 px-6">
        {submitError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {submitError}
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="core-theme">Core Theme *</Label>
          <Input
            id="core-theme"
            name="coreTheme"
            value={formData.coreTheme}
            onChange={(e) => handleInputChange("coreTheme", e.target.value)}
            placeholder="Enter your core theme here"
            className={errors.coreTheme ? "border-red-500" : ""}
          />
          {errors.coreTheme && (
            <p className="text-sm text-red-500">{errors.coreTheme}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="hair">Hair *</Label>
          <Input
            id="hair"
            name="hair"
            value={formData.hair}
            onChange={(e) => handleInputChange("hair", e.target.value)}
            placeholder="Enter your hair here"
            className={errors.hair ? "border-red-500" : ""}
          />
          {errors.hair && <p className="text-sm text-red-500">{errors.hair}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="pose">Pose *</Label>
          <Input
            id="pose"
            name="pose"
            value={formData.pose}
            onChange={(e) => handleInputChange("pose", e.target.value)}
            placeholder="Enter your pose here"
            className={errors.pose ? "border-red-500" : ""}
          />
          {errors.pose && <p className="text-sm text-red-500">{errors.pose}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="outfit">Outfit *</Label>
          <Input
            id="outfit"
            name="outfit"
            value={formData.outfit}
            onChange={(e) => handleInputChange("outfit", e.target.value)}
            placeholder="Enter your outfit here"
            className={errors.outfit ? "border-red-500" : ""}
          />
          {errors.outfit && (
            <p className="text-sm text-red-500">{errors.outfit}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="atmosphere">Atmosphere *</Label>
          <Input
            id="atmosphere"
            name="atmosphere"
            value={formData.atmosphere}
            onChange={(e) => handleInputChange("atmosphere", e.target.value)}
            placeholder="Enter your atmosphere here"
            className={errors.atmosphere ? "border-red-500" : ""}
          />
          {errors.atmosphere && (
            <p className="text-sm text-red-500">{errors.atmosphere}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="gaze">Gaze *</Label>
          <Input
            id="gaze"
            name="gaze"
            value={formData.gaze}
            onChange={(e) => handleInputChange("gaze", e.target.value)}
            placeholder="Enter your gaze here"
            className={errors.gaze ? "border-red-500" : ""}
          />
          {errors.gaze && <p className="text-sm text-red-500">{errors.gaze}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="makeup">Makeup *</Label>
          <Input
            id="makeup"
            name="makeup"
            value={formData.makeup}
            onChange={(e) => handleInputChange("makeup", e.target.value)}
            placeholder="Enter your makeup here"
            className={errors.makeup ? "border-red-500" : ""}
          />
          {errors.makeup && (
            <p className="text-sm text-red-500">{errors.makeup}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="background">Background *</Label>
          <Input
            id="background"
            name="background"
            value={formData.background}
            onChange={(e) => handleInputChange("background", e.target.value)}
            placeholder="Enter your background here"
            className={errors.background ? "border-red-500" : ""}
          />
          {errors.background && (
            <p className="text-sm text-red-500">{errors.background}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="details">Details</Label>
          <Input
            id="details"
            name="details"
            value={formData.details}
            onChange={(e) => handleInputChange("details", e.target.value)}
            placeholder="Enter additional details (optional)"
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="aspect-ratio">Aspect Ratio *</Label>
          <Select
            value={formData.aspectRatio}
            onValueChange={(value) => handleInputChange("aspectRatio", value)}
          >
            <SelectTrigger
              className={errors.aspectRatio ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select an aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9:16">9:16</SelectItem>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="3:4">3:4</SelectItem>
              <SelectItem value="2:3">2:3</SelectItem>
              <SelectItem value="3:2">3:2</SelectItem>
            </SelectContent>
          </Select>
          {errors.aspectRatio && (
            <p className="text-sm text-red-500">{errors.aspectRatio}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="full-prompt">Full Prompt</Label>
          <Textarea
            id="full-prompt"
            name="fullPrompt"
            value={formData.fullPrompt}
            onChange={(e) => handleInputChange("fullPrompt", e.target.value)}
            placeholder="Enter full prompt (optional, leave empty to auto-generate)"
            rows={4}
          />
        </div>
      </div>
      <div className="px-6 pt-4 pb-6 flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "저장 중..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
