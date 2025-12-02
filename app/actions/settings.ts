"use server";

import {
  getSystemInstruction,
  updateSystemInstruction,
  getImageAnalysisInstruction,
  updateImageAnalysisInstruction,
} from "@/lib/services/settings";
import { revalidateTag } from "next/cache";

export async function fetchSystemInstruction() {
  try {
    const instruction = await getSystemInstruction();
    return { success: true, data: instruction };
  } catch (error) {
    console.error("Failed to fetch system instruction:", error);
    return { success: false, error: "Failed to fetch system instruction" };
  }
}

export async function saveSystemInstruction(value: string) {
  try {
    await updateSystemInstruction(value);
    revalidateTag("settings", { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Failed to save system instruction:", error);
    return { success: false, error: "Failed to save system instruction" };
  }
}

export async function fetchImageAnalysisInstruction() {
  try {
    const instruction = await getImageAnalysisInstruction();
    return { success: true, data: instruction };
  } catch (error) {
    console.error("Failed to fetch image analysis instruction:", error);
    return {
      success: false,
      error: "Failed to fetch image analysis instruction",
    };
  }
}

export async function saveImageAnalysisInstruction(value: string) {
  try {
    await updateImageAnalysisInstruction(value);
    revalidateTag("settings", { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Failed to save image analysis instruction:", error);
    return {
      success: false,
      error: "Failed to save image analysis instruction",
    };
  }
}
