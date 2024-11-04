"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Expand } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "./copy-button";
import { type ResultViewProps } from "../app/types";

export function ResultView({ result, blockName }: ResultViewProps) {
  const resultString =
    typeof result === "object"
      ? JSON.stringify(result, null, 2)
      : String(result);

  const truncatedResult =
    resultString.slice(0, 200) + (resultString.length > 200 ? "..." : "");

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <Label>Result</Label>
        <CopyButton text={resultString} />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <div
            className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap cursor-pointer 
              hover:bg-gray-100 transition-colors relative group"
          >
            <div
              className="absolute top-2 right-2 text-gray-400 
              opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Expand className="w-4 h-4" />
            </div>
            {truncatedResult}
            {resultString.length > 200 && (
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-50 to-transparent group-hover:from-gray-100" />
            )}
          </div>
        </SheetTrigger>
        <SheetContent className="w-[90vw] sm:max-w-[600px]">
          <SheetHeader>
            <div className="flex items-left gap-1">
              <SheetTitle>Result: {blockName}</SheetTitle>
              <CopyButton text={resultString} />
            </div>
            <SheetDescription>Generated output for this block</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            <div className="pb-8">
              <pre className="whitespace-pre-wrap text-foreground bg-gray-50 p-4 rounded-lg">
                {resultString}
              </pre>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
} 