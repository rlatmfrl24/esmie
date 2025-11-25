"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Version {
  version: number;
  created_at: string;
  isCurrent: boolean;
}

interface VersionSelectorProps {
  promptId: string;
  currentVersion: number;
  versions: Version[];
}

export function VersionSelector({
  promptId,
  currentVersion,
  versions,
}: VersionSelectorProps) {
  const router = useRouter();

  return (
    <Select
      value={currentVersion.toString()}
      onValueChange={(val) => {
        const v = parseInt(val);
        const selected = versions.find((ver) => ver.version === v);
        if (selected?.isCurrent) {
          router.push(`/prompt/${promptId}`);
        } else {
          router.push(`/prompt/${promptId}?version=${val}`);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Version" />
      </SelectTrigger>
      <SelectContent>
        {versions.map((v) => (
          <SelectItem key={v.version} value={v.version.toString()}>
            v{v.version} ({new Date(v.created_at).toLocaleDateString()})
            {v.isCurrent ? " (Latest)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
