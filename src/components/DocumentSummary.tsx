'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'

type ApiResponse = Record<string, any>

interface DocumentSummaryProps {
  apiResponse: ApiResponse
}

const CONFIDENCE_THRESHOLD = 80

// Recursive function to render fields with confidence-based colours
const renderContent = (data: any, confidenceScore?: any) => {
  if (typeof data !== 'object' || data === null) {
    return (
      <Input value={data !== null ? data : ''} readOnly className="mb-3" />
    )
  }

  return Object.entries(data).map(([key, value]) => {
    if (key === 'confidence_score') {
      return null // skip displaying confidence_score itself
    }

    // Get corresponding confidence score if available
    const score = confidenceScore ? confidenceScore[key] : undefined

    // Decide colour based on confidence
    const inputClass = clsx(
      'mb-2',
      score !== undefined &&
        (score < CONFIDENCE_THRESHOLD
          ? 'border-yellow-500'
          : 'border-green-500')
    )

    return (
      <div key={key} className="mb-4">
        <div className="font-medium capitalize mb-1">{key.replace(/_/g, ' ')}</div>

        {typeof value === 'object' && value !== null ? (
          <div className="pl-4 border-l">
            {renderContent(
              value,
              typeof value === 'object' && value !== null && 'confidence_score' in value
                ? (value as { confidence_score: any }).confidence_score
                : undefined
            )}
          </div>
        ) : (
          <Input
            value={value !== null && value !== undefined ? String(value) : ''}
            readOnly
            className={inputClass}
          />
        )}
      </div>
    )
  })
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ apiResponse }) => {
  const entries = Object.entries(apiResponse)

  return (
    <div className="space-y-6 p-6">
      {entries.map(([section, content], index) => (
        <React.Fragment key={section}>
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{section.replace(/_/g, ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent(content, content.confidence_score)}
            </CardContent>
          </Card>
          {index !== entries.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default DocumentSummary
