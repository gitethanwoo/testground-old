import { useCallback } from "react";
import { type Block } from "../types";
import { type DropResult } from "@hello-pangea/dnd";

interface UseBlocksProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

export function useBlocks({ blocks, onBlocksChange }: UseBlocksProps) {
  const updateBlockName = useCallback((id: string, name: string) => {
    onBlocksChange(
      blocks.map((block) => (block.id === id ? { ...block, name } : block))
    );
  }, [blocks, onBlocksChange]);

  const toggleBlockExpanded = useCallback((id: string) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, expanded: !block.expanded } : block
      )
    );
  }, [blocks, onBlocksChange]);

  const removeBlock = useCallback((id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id));
  }, [blocks, onBlocksChange]);

  const updateBlockSettings = useCallback((id: string, settings: Partial<Block["settings"]>) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id
          ? { ...block, settings: { ...block.settings, ...settings } }
          : block
      )
    );
  }, [blocks, onBlocksChange]);

  const getAvailableVariables = useCallback((currentIndex: number) => {
    if (currentIndex === 0) return [];
    const previousBlock = blocks[currentIndex - 1];
    return [
      {
        name: previousBlock.name,
        type: previousBlock.type,
        valueType: "input" as const,
        displayName: previousBlock.name,
      },
    ];
  }, [blocks]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onBlocksChange(items);
  }, [blocks, onBlocksChange]);

  return {
    updateBlockName,
    toggleBlockExpanded,
    removeBlock,
    updateBlockSettings,
    getAvailableVariables,
    onDragEnd,
  };
} 