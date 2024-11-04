"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Box,
  CircleDashed,
  ListTree,
  ListFilter,
  Type,
  Hash,
  ToggleLeft,
  List,
  Plus,
  X,
} from "lucide-react";
import { type SchemaDefinition, type SchemaProperty } from "../app/types";

interface SchemaBuilderProps {
  value: SchemaDefinition;
  onChange: (schema: SchemaDefinition) => void;
}

export function SchemaBuilder({ value, onChange }: SchemaBuilderProps) {
  const addProperty = () => {
    onChange({
      ...value,
      properties: [...(value.properties || []), { name: "", type: "string" }],
    });
  };

  const updateProperty = (index: number, updates: Partial<SchemaProperty>) => {
    const newProperties = [...(value.properties || [])];
    newProperties[index] = { ...newProperties[index], ...updates };
    onChange({ ...value, properties: newProperties });
  };

  const removeProperty = (index: number) => {
    const newProperties = [...(value.properties || [])];
    newProperties.splice(index, 1);
    onChange({ ...value, properties: newProperties });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>What kind of response do you want?</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={value.outputType === "object" ? "default" : "outline"}
            onClick={() => onChange({ ...value, outputType: "object" })}
            className="flex items-center justify-start gap-3 h-auto py-3 px-4"
          >
            <Box className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Single Item</span>
          </Button>

          <Button
            variant={value.outputType === "array" ? "default" : "outline"}
            onClick={() => onChange({ ...value, outputType: "array" })}
            className="flex items-center justify-start gap-3 h-auto py-3 px-4"
          >
            <ListTree className="w-5 h-5 shrink-0" />
            <span className="font-semibold">List of Items</span>
          </Button>

          <Button
            variant={value.outputType === "enum" ? "default" : "outline"}
            onClick={() => onChange({ ...value, outputType: "enum" })}
            className="flex items-center justify-start gap-3 h-auto py-3 px-4"
          >
            <ListFilter className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Single Choice</span>
          </Button>
        </div>
      </div>

      {value.outputType === "enum" ? (
        <div className="space-y-2">
          <Label>Possible Values</Label>
          <div className="space-y-2">
            {(value.enumValues || []).map((enumValue, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={enumValue}
                  onChange={(e) => {
                    const newValues = [...(value.enumValues || [])];
                    newValues[index] = e.target.value;
                    onChange({ ...value, enumValues: newValues });
                  }}
                  placeholder="Enter a possible value"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newValues = [...(value.enumValues || [])];
                    newValues.splice(index, 1);
                    onChange({ ...value, enumValues: newValues });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...value,
                  enumValues: [...(value.enumValues || []), ""],
                })
              }
            >
              Add Value
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Properties</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define what fields you want in your response
              </p>
            </div>
            <Button onClick={addProperty} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Field
            </Button>
          </div>

          {(value.properties || []).length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 text-center">
              <CircleDashed className="w-8 h-8 text-muted-foreground/60" />
              <div>
                <p className="font-medium">No fields defined</p>
                <p className="text-sm text-muted-foreground">
                  Add fields to define the structure of your response
                </p>
              </div>
              <Button variant="outline" onClick={addProperty} className="mt-2">
                Add Your First Field
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(value.properties || []).map((prop, index) => (
                <div
                  key={index}
                  className="group relative border bg-card rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProperty(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-100 border shadow-sm opacity-0 text-gray-600 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-[3]">
                        <Input
                          value={prop.name}
                          onChange={(e) =>
                            updateProperty(index, { name: e.target.value })
                          }
                          placeholder="Field name"
                          className="font-medium"
                        />
                      </div>
                      <div className="flex-[2]">
                        <Select
                          value={prop.type}
                          onValueChange={(v: SchemaProperty["type"]) =>
                            updateProperty(index, { type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string" className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                <Type className="w-4 h-4" />
                                <span>Text (string)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="number" className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                <span>Number</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="boolean" className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                <ToggleLeft className="w-4 h-4" />
                                <span>Yes/No (boolean)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="string[]" className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                <List className="w-4 h-4" />
                                <span>List of Text</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Input
                      value={prop.description || ""}
                      onChange={(e) =>
                        updateProperty(index, { description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 