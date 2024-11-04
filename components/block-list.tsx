"use client";

import React from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MessageSquare,
  Play,
  Settings2,
  Trash2,
  Wand2,
} from "lucide-react";
import { type Block } from "../app/types";
import { useBlocks } from "../app/hooks/use-blocks";
import RichMentionsTextarea from "./mention-textarea";
import { BlockSettings } from "./block-settings";
import { SettingsBadges } from "./settings-badges";
import { ResultView } from "./result-view";

interface BlockListProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  openSettingsId: string | null;
  setOpenSettingsId: (id: string | null) => void;
  executeBlock: (blockIndex: number) => Promise<void>;
}

export function BlockList({
  blocks,
  onBlocksChange,
  openSettingsId,
  setOpenSettingsId,
  executeBlock,
}: BlockListProps) {
  const {
    updateBlockName,
    toggleBlockExpanded,
    removeBlock,
    updateBlockSettings,
    getAvailableVariables,
    onDragEnd,
  } = useBlocks({ blocks, onBlocksChange });

  const getBlockIcon = (type: Block["type"]) => {
    switch (type) {
      case "Input":
        return <MessageSquare className="w-4 h-4" />;
      case "Generate":
        return <Wand2 className="w-4 h-4" />;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="blocks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="relative space-y-4 py-2"
          >
            {blocks.length > 1 && (
              <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 to-blue-300 -z-10" />
            )}

            {blocks.map((block, index) => (
              <Draggable key={block.id} draggableId={block.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    data-block-id={block.id}
                    className={`border shadow-sm 
                      transition-shadow duration-200 
                      hover:shadow-md 
                      ${block.expanded ? "bg-white" : "bg-gray-50"}
                      ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-100" : ""}`}
                    onMouseDown={(e) => {
                      if (
                        e.target instanceof HTMLInputElement ||
                        e.target instanceof HTMLTextAreaElement
                      ) {
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`flex items-center gap-2 p-3 
                        ${block.expanded ? "bg-blue-50/50" : "bg-secondary/20"}
                        transition-colors duration-200`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center justify-center w-8 h-8 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className={`p-1.5 rounded-md 
                            ${block.type === "Input"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {getBlockIcon(block.type)}
                          </div>
                          <Input
                            type="text"
                            value={block.name}
                            onChange={(e) =>
                              updateBlockName(block.id, e.target.value.slice(0, 50))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold shadow-none bg-transparent border-none focus-visible:ring-0 rounded px-1 py-0.5 w-full"
                            placeholder={block.type}
                            maxLength={64}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {block.type === "Generate" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  executeBlock(index);
                                }}
                                disabled={block.isExecuting}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <BlockSettings
                                block={block}
                                onUpdate={(settings) =>
                                  updateBlockSettings(block.id, settings)
                                }
                                isOpen={openSettingsId === block.id}
                                onOpenChange={(open) =>
                                  setOpenSettingsId(open ? block.id : null)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenSettingsId(block.id);
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Settings2 className="w-3 h-3 mr-1" />
                                Configure
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBlockExpanded(block.id)}
                          >
                            {block.expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBlock(block.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {block.expanded && (
                        <CardContent className="p-4 space-y-4 border-t">
                          <div className="space-y-4">
                            {block.type === "Generate" && (
                              <>
                                <div className="space-y-2">
                                  <Label>Prompt Template</Label>
                                  <RichMentionsTextarea
                                    value={block.settings.prompt || ""}
                                    onChange={(value) =>
                                      updateBlockSettings(block.id, {
                                        prompt: value,
                                      })
                                    }
                                    placeholder="Enter your prompt template... Use @blockName to reference previous blocks"
                                    availableVariables={getAvailableVariables(index)}
                                  />
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-muted-foreground">
                                      Output Configuration
                                    </Label>
                                  </div>
                                  <SettingsBadges settings={block.settings} />
                                </div>

                                {block.isExecuting && (
                                  <div className="mt-4">
                                    <div className="animate-pulse flex space-x-4">
                                      <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                          <div className="h-4 bg-gray-200 rounded"></div>
                                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {block.result && !block.isExecuting && (
                                  <ResultView
                                    result={block.result}
                                    blockName={block.name}
                                  />
                                )}
                              </>
                            )}

                            {block.type === "Input" && (
                              <div className="space-y-2">
                                <RichMentionsTextarea
                                  value={block.settings.input || ""}
                                  onChange={(value) =>
                                    updateBlockSettings(block.id, {
                                      input: value,
                                    })
                                  }
                                  placeholder="Enter your input..."
                                  availableVariables={getAvailableVariables(index)}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </div>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 