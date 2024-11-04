import { useCallback } from "react";
import { type Block } from "@/app/types";

interface UseBlockExecutionProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  parsePromptTemplate: (template: string, blocks: Block[], currentIndex: number) => string;
}

export function useBlockExecution({ blocks, onBlocksChange, parsePromptTemplate }: UseBlockExecutionProps) {
  const executeBlock = useCallback(async (blockIndex: number) => {
    const block = blocks[blockIndex];
    console.log(`\nExecuting block:`, block.name, block.type);

    if (block.type === "Generate") {
      onBlocksChange(
        blocks.map((b) => (b.id === block.id ? { ...b, isExecuting: true } : b))
      );

      try {
        const parsedPrompt = parsePromptTemplate(
          block.settings.prompt || "",
          blocks,
          blockIndex
        );
        console.log("Sending prompt to API:", parsedPrompt);

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: parsedPrompt,
            generateType: block.settings.generateType,
            temperature: block.settings.temperature,
            maxTokens: block.settings.maxTokens,
            ...(block.settings.generateType === "object"
              ? { schemaDefinition: block.settings.schemaDefinition }
              : {}),
          }),
        });

        let result: string | object;
        if (block.settings.generateType === "text") {
          result = await response.text();
        } else {
          const data = await response.json();
          result = data.result;
        }

        console.log("Received result:", result);

        onBlocksChange(
          blocks.map((b) =>
            b.id === block.id ? { ...b, result, isExecuting: false } : b
          )
        );
      } catch (error) {
        console.error("Error executing block:", error);
        onBlocksChange(
          blocks.map((b) =>
            b.id === block.id
              ? { ...b, result: "Error executing block", isExecuting: false }
              : b
          )
        );
      }
    } else if (block.type === "Input") {
      onBlocksChange(
        blocks.map((b) =>
          b.id === block.id ? { ...b, result: b.settings.input } : b
        )
      );
    }
  }, [blocks, onBlocksChange, parsePromptTemplate]);

  const executeBlockByKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const blockElement = document.activeElement?.closest("[data-block-id]");
        if (blockElement) {
          const blockId = blockElement.getAttribute("data-block-id");
          const blockIndex = blocks.findIndex((b) => b.id === blockId);

          if (blockIndex !== -1 && blocks[blockIndex].type === "Generate") {
            e.preventDefault();
            executeBlock(blockIndex);
          }
        }
      }
    },
    [blocks, executeBlock]
  );

  const executeFlow = useCallback(async () => {
    for (let i = 0; i < blocks.length; i++) {
      await executeBlock(i);
    }
  }, [blocks, executeBlock]);

  return {
    executeBlock,
    executeBlockByKeyboard,
    executeFlow,
  };
} 