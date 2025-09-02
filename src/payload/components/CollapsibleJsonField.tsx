'use client'

import React, { useState } from 'react'
import './CollapsibleJsonField.css'

// This component is designed to work as a custom field component in Payload collections
// It will receive props from Payload's field system
interface CollapsibleJsonFieldProps {
  path?: string
  label?: string
  required?: boolean
  readOnly?: boolean
  value?: any
  onChange?: (value: any) => void
  // Payload field props
  field?: any
  admin?: any
  // Additional props that Payload might pass
  [key: string]: any
}

export const CollapsibleJsonField: React.FC<CollapsibleJsonFieldProps> = (props) => {
  const { path, label, required, readOnly, value, onChange, field, admin, ...restProps } = props

  const [isExpanded, setIsExpanded] = useState(false)
  const [previewLines] = useState(5) // Show more lines in preview for better context

  // Try to get the field label from various sources
  // Payload might pass the field info in different ways
  const fieldLabel =
    label ||
    admin?.label ||
    field?.label ||
    field?.name ||
    (restProps as any)?.field?.label ||
    (restProps as any)?.field?.name ||
    // Try to get from the path if available
    (path &&
      path
        .split('.')
        .pop()
        ?.replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())) ||
    'JSON Field'

  // Use provided value or fallback to sample data for demonstration
  // In a real implementation, this would come from Payload's field system
  const jsonValue = value || {
    // Sample data that represents what a real booking snapshot might look like
    bookingId: 'BK-2025-001',
    customer: {
      id: 'CUST-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91-98765-43210',
    },
    property: {
      id: 'PROP-001',
      name: 'Sunset Apartments',
      address: '123 Main Street, City, State 12345',
      type: 'apartment',
    },
    room: {
      id: 'ROOM-101',
      number: '101',
      floor: 1,
      amenities: ['AC', 'WiFi', 'Kitchen', 'Balcony'],
    },
    dates: {
      checkIn: '2025-08-01T14:00:00Z',
      checkOut: '2025-08-31T11:00:00Z',
      totalNights: 30,
    },
    pricing: {
      baseRate: 1500.0,
      taxes: 150.0,
      total: 1650.0,
      currency: 'INR',
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const copyToClipboard = async () => {
    if (!jsonString) return
    try {
      await navigator.clipboard.writeText(jsonString)
      // You could add a toast notification here
      console.log('JSON copied to clipboard')
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }

  // Format JSON data for display with syntax highlighting
  const formatJsonData = (data: any) => {
    if (!data) return null

    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      return jsonString
    } catch (error) {
      return String(data)
    }
  }

  // Add syntax highlighting to JSON
  const highlightJson = (jsonString: string) => {
    return jsonString
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/"([^"]*)"/g, '<span class="json-string">"$1"</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>')
  }

  const jsonString = formatJsonData(jsonValue)

  if (!jsonString) {
    return (
      <div className="field-type field-type-json">
        <label className="field-label">
          {fieldLabel}
          {required && <span className="required">*</span>}
        </label>
        <div className="field-input">
          <div className="json-field-container">
            <div className="json-field-empty">
              <span className="text-muted">No JSON data available</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const lines = jsonString.split('\n')
  const previewText = lines.slice(0, previewLines).join('\n')
  const hasMoreLines = lines.length > previewLines

  return (
    <div className="field-type field-type-json">
      <label className="field-label">
        {fieldLabel}
        {required && <span className="required">*</span>}
      </label>
      <div className="field-input">
        <div className="json-field-container">
          <pre className={`json-content ${isExpanded ? 'expanded' : ''}`}>
            <code
              dangerouslySetInnerHTML={{
                __html: isExpanded ? highlightJson(jsonString) : highlightJson(previewText),
              }}
            />
            {hasMoreLines && !isExpanded && (
              <div className="json-preview-overlay">
                <span className="text-muted">...</span>
                <span className="text-muted text-sm">{lines.length - previewLines} more lines</span>
              </div>
            )}
          </pre>
          {hasMoreLines && (
            <div className="json-controls">
              <button type="button" onClick={toggleExpanded} className="json-toggle-btn">
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
              {isExpanded && (
                <>
                  <button type="button" onClick={copyToClipboard} className="json-copy-btn">
                    Copy JSON
                  </button>
                  <span className="json-line-count">Total: {lines.length} lines</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleJsonField
