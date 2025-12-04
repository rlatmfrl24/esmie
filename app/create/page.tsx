"use client";

import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateModeSelector } from "@/components/create/create-mode-selector";
import { KeywordsInput } from "@/components/create/keywords-input";
import { PromptInput } from "@/components/create/prompt-input";
import { ImageInput } from "@/components/create/image-input";
import { PromptForm } from "@/components/prompts/prompt-form";
import { useCreatePrompt } from "./use-create-prompt";

export default function CreatePage() {
  const {
    mode,
    step,
    isLoading,
    generatedData,
    error,
    handleModeSelect,
    handleBack,
    handleGenerateFromKeywords,
    handleGenerateFromText,
    handleGenerateFromImage,
    handleSave,
  } = useCreatePrompt();

  return (
    <div className="bg-linear-gradient(to bottom, #000000, #1a1a1a) flex-1">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 mb-12 text-center relative">
          {step !== "selection" && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="absolute left-0 top-0 hidden md:flex hover:bg-transparent hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
          )}

          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
              Create New Prompt
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {step === "selection" &&
              "Choose how you want to start creating your masterpiece."}
            {step === "input" &&
              mode === "keywords" &&
              "Select keywords to build your prompt."}
            {step === "input" &&
              mode === "prompt" &&
              "Describe what you want to see."}
            {step === "input" &&
              mode === "image" &&
              "Upload an image to use as a reference."}
            {step === "review" && "Review and fine-tune your generated prompt."}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center justify-center animate-in fade-in slide-in-from-top-2">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="relative min-h-[400px]">
          {/* Step 1: Mode Selection */}
          {step === "selection" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <CreateModeSelector onSelect={handleModeSelect} />
            </div>
          )}

          {/* Step 2: Input Methods */}
          {step === "input" && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
                {mode === "keywords" && (
                  <KeywordsInput
                    onGenerate={handleGenerateFromKeywords}
                    isLoading={isLoading}
                  />
                )}
                {mode === "prompt" && (
                  <PromptInput
                    onGenerate={handleGenerateFromText}
                    isLoading={isLoading}
                  />
                )}
                {mode === "image" && (
                  <ImageInput
                    onGenerate={handleGenerateFromImage}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Edit */}
          {step === "review" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="border-b bg-muted/30 p-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Wand2 className="w-5 h-5 mr-2 text-primary" />
                    Review & Edit
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    We&apos;ve generated a prompt based on your input. Customize
                    it to perfection.
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <PromptForm
                    initialData={generatedData}
                    onSubmit={handleSave}
                    onCancel={handleBack}
                    isLoading={isLoading}
                    submitError={error}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
