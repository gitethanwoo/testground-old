'use client'

import React from 'react'
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions'
import { BlockType } from '../app/types'

interface RichMentionsTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  availableVariables: Array<{
    name: string
    type: BlockType
    valueType: 'input' | 'result'
    displayName: string
  }>
}

interface BlockVariable extends SuggestionDataItem {
  id: string
  display: string
  type: BlockType
}

const style = {
  control: {
  },
  input: {
    margin: 0,
    padding: '8px 12px',
    overflow: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    width: '100%',
    display: 'block',
  },
  highlighter: {
    padding: '8px 12px',
  },
  suggestions: {
    width: 'max-content',
    minWidth: 'unset !important',
    list: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      overflow: 'hidden',
      width: 'max-content'
    },
    item: {
      borderBottom: '1px solid #f0f0f0',
      width: 'max-content',
      fontWeight: '600',
    },
  },
}

const mentionStyle = {
  backgroundColor: '#e0eaff',

  fontWeight: '500',
  zIndex: '1',
  borderRadius: '6px',
  color: '#1d4ed8',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.15s ease',
  textDecoration: 'none',
  display: 'inline-block',
  position: 'relative',

  pointerEvents: 'none',
  '&focused': {
    backgroundColor: '#d1deff',
  },
  '&input': {
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
  },
  '&result': {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
}

// Add spaces in the transform instead of padding
const displayTransform = (id: string, display: string) => ` @${display}  `

export default function RichMentionsTextarea({
  value,
  onChange,
  placeholder,
  availableVariables
}: RichMentionsTextareaProps) {
  const renderSuggestion = (
    suggestion: SuggestionDataItem,
    search: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean
  ): React.ReactNode => (
    <div className={`py-1 px-2 ${focused ? 'bg-blue-50 text-blue-600' : ''}`}>
      <span>{(suggestion as BlockVariable).display}</span>
    </div>
  )

  return (
    <div className="w-full">
      <MentionsInput
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        placeholder={placeholder}
        style={style}
        className="min-h-[100px] w-full rounded-xl"
      >
        <Mention
          trigger="@"
          data={availableVariables.map(v => ({
            id: v.name,
            display: v.displayName,
            type: v.type,
            valueType: v.valueType
          }))}
          renderSuggestion={renderSuggestion}
          displayTransform={displayTransform}
          markup="@[__display__](__id__)"
          style={mentionStyle}
        />
      </MentionsInput>
    </div>
  )
}