"use client";

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";

export function AddNewPrompt() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4" />
          Add New Prompt
        </Button>
      </DialogTrigger>
      <form>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Add a new prompt to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Core Theme</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="Enter your core theme here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="hair-1">Hair</Label>
              <Input
                id="hair-1"
                name="hair"
                placeholder="Enter your hair here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="pose-1">Pose</Label>
              <Input
                id="pose-1"
                name="pose"
                placeholder="Enter your pose here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="outfit-1">outfit</Label>
              <Input
                id="outfit-1"
                name="outfit"
                placeholder="Enter your outfit here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="atmosphere-1">Atmosphere</Label>
              <Input
                id="atmosphere-1"
                name="atmosphere"
                placeholder="Enter your atmosphere here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="gaze-1">Gaze</Label>
              <Input
                id="gaze-1"
                name="gaze"
                placeholder="Enter your background here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="makeup-1">Makeup</Label>
              <Input
                id="makeup-1"
                name="makeup"
                placeholder="Enter your lighting here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="background-1">Background</Label>
              <Input
                id="background-1"
                name="background"
                placeholder="Enter your background here"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="aspect-ratio-1">Aspect Ratio</Label>
              <Select name="aspect-ratio">
                <SelectTrigger>
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
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
