"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wand2 } from "lucide-react";
import { BlockList } from "../components/block-list";
import { type Block, type BlockType } from "./types";
import { useBlockExecution } from "./hooks/use-block-execution";

export default function Component() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  const parsePromptTemplate = useCallback(
    (template: string, blocks: Block[], currentIndex: number): string => {
      console.log('Parsing template:', template);
      
      return template.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (_, display) => {
        const previousBlock = blocks[currentIndex - 1];
        if (previousBlock?.name !== display) {
          console.log('Block name mismatch:', { expected: display, actual: previousBlock?.name });
          return '';
        }

        // For Input blocks, use the input value
        if (previousBlock.type === 'Input') {
          const value = previousBlock.settings.input || '';
          console.log('Using input value:', value);
          return value;
        }

        // For Generate blocks, use the result
        if (previousBlock.result) {
          if (Array.isArray(previousBlock.result)) {
            // If it's an array, map through and stringify each item
            const stringified = previousBlock.result
              .map(item => typeof item === 'object' ? JSON.stringify(item) : String(item))
              .join(', ');
            console.log('Using array result:', stringified);
            return stringified;
          } else if (typeof previousBlock.result === 'object') {
            // If it's a single object, stringify it
            const stringified = JSON.stringify(previousBlock.result);
            console.log('Using object result:', stringified);
            return stringified;
          } else {
            // For primitive values, convert to string
            const value = String(previousBlock.result);
            console.log('Using primitive result:', value);
            return value;
          }
        }

        console.log('No valid value found, returning empty string');
        return '';
      });
    },
    [] // No dependencies needed as it's a pure function
  );

  const { executeBlock, executeBlockByKeyboard, executeFlow } = useBlockExecution({
    blocks,
    onBlocksChange: setBlocks,
    parsePromptTemplate,
  });

  useEffect(() => {
    document.addEventListener("keydown", executeBlockByKeyboard);
    return () => {
      document.removeEventListener("keydown", executeBlockByKeyboard);
    };
  }, [executeBlockByKeyboard]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      expanded: true,
      name: type,
      settings: {
        generateType: "text",
        temperature: 0.7,
        maxTokens: 1000,
      },
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">LLM Flow Builder</h1>
          <p className="text-muted-foreground">
            Create and test different modular LLM flows
          </p>
        </div>

        <BlockList
          blocks={blocks}
          onBlocksChange={setBlocks}
          openSettingsId={openSettingsId}
          setOpenSettingsId={setOpenSettingsId}
          executeBlock={executeBlock}
        />

        <div className="flex gap-2 mt-8">
          <Button
            onClick={() => addBlock("Input")}
            variant="outline"
            className="hover:bg-purple-50 transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
            Add Input
          </Button>
          <Button
            onClick={() => addBlock("Generate")}
            variant="outline"
            className="hover:bg-amber-50 transition-colors"
          >
            <Wand2 className="w-4 h-4 mr-2 text-amber-600" />
            Add Generate
          </Button>
          <Button
            onClick={executeFlow}
            variant="default"
            className="ml-auto"
            disabled={blocks.length === 0}
          >
            Execute Flow
          </Button>
        </div>
      </div>
    </div>
  );
}
