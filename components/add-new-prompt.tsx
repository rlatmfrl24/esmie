"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/client";
import { PromptFormData } from "@/lib/types";
import { generateFullPrompt } from "@/lib/utils";

interface FormData {
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

export function AddNewPrompt() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
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
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      console.log("Supabase client created");

      // 현재 사용자 정보 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      const insertData = {
        core_theme: formData.coreTheme,
        version: 1,
        hair: formData.hair,
        pose: formData.pose,
        outfit: formData.outfit,
        atmosphere: formData.atmosphere,
        gaze: formData.gaze,
        makeup: formData.makeup,
        background: formData.background,
        final_prompt: "",
        aspect_ratio: formData.aspectRatio,
        user_id: user.id,
        details: formData.details || "",
      };

      // fullPrompt가 입력된 경우 사용하고, 없으면 자동 생성
      const finalPrompt = formData.fullPrompt.trim()
        ? formData.fullPrompt
        : generateFullPrompt(insertData as PromptFormData);
      insertData.final_prompt = finalPrompt;
      console.log("Inserting data:", insertData);

      const { data, error } = await supabase
        .from("prompts")
        .insert([insertData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Data inserted successfully:", data);

      // 성공 시 폼 초기화 및 다이얼로그 닫기
      setFormData({
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
      });
      setErrors({});
      setOpen(false);

      // 페이지 새로고침하여 최신 데이터 표시
      window.location.reload();
    } catch (error) {
      console.error("Error saving prompt:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4" />
          Add New Prompt
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[70vw] max-h-[80vh] flex flex-col p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Add a new prompt to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 overflow-y-auto flex-1 min-h-0 px-6">
            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {errors.submit}
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
              {errors.hair && (
                <p className="text-sm text-red-500">{errors.hair}</p>
              )}
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
              {errors.pose && (
                <p className="text-sm text-red-500">{errors.pose}</p>
              )}
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
                onChange={(e) =>
                  handleInputChange("atmosphere", e.target.value)
                }
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
              {errors.gaze && (
                <p className="text-sm text-red-500">{errors.gaze}</p>
              )}
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
                onChange={(e) =>
                  handleInputChange("background", e.target.value)
                }
                placeholder="Enter your background here"
                className={errors.background ? "border-red-500" : ""}
              />
              {errors.background && (
                <p className="text-sm text-red-500">{errors.background}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="aspect-ratio">Aspect Ratio *</Label>
              <Select
                value={formData.aspectRatio}
                onValueChange={(value) =>
                  handleInputChange("aspectRatio", value)
                }
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
              <Label htmlFor="full-prompt">Full Prompt</Label>
              <Textarea
                id="full-prompt"
                name="fullPrompt"
                value={formData.fullPrompt}
                onChange={(e) =>
                  handleInputChange("fullPrompt", e.target.value)
                }
                placeholder="Enter full prompt (optional, leave empty to auto-generate)"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="px-6 pt-4 pb-6 border-t">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
