"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Type, Image as ImageIcon, Edit3, Keyboard } from "lucide-react";

export type CreateMode = "keywords" | "prompt" | "image" | "manual";

interface CreateModeSelectorProps {
  onSelect: (mode: CreateMode) => void;
}

export function CreateModeSelector({ onSelect }: CreateModeSelectorProps) {
  const modes = [
    {
      id: "keywords" as CreateMode,
      title: "From Keywords",
      description: "Generate a prompt from a list of keywords.",
      icon: Type,
    },
    {
      id: "prompt" as CreateMode,
      title: "From Prompt",
      description: "Refine or expand an existing prompt description.",
      icon: Edit3,
    },
    {
      id: "image" as CreateMode,
      title: "From Image",
      description: "Generate a prompt based on an uploaded reference image.",
      icon: ImageIcon,
    },
    {
      id: "manual" as CreateMode,
      title: "Manual Input",
      description: "Manually enter all prompt details.",
      icon: Keyboard,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto p-4">
      {modes.map((mode) => (
        <Card
          key={mode.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(mode.id)}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <mode.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {mode.title}
              </CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}




