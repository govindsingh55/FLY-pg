'use client'

import React from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import { generateSlug } from '../generateSlug'

type SlugFieldProps = {
  path: string
  required?: boolean
}

export const SlugField: React.FC<SlugFieldProps> = ({ path, required }) => {
  const { value, setValue } = useField<string>({ path })
  const nameField = useFormFields(([fields]) => fields.name)

  const handleFormatSlug = () => {
    const currentValue = value || ''
    const nameValue = nameField?.value as string | undefined

    // If there's a current value, format it
    if (currentValue.trim()) {
      const formatted = generateSlug(currentValue)
      setValue(formatted)
    }
    // If no value but there's a name, generate from name
    else if (nameValue?.trim()) {
      const formatted = generateSlug(nameValue)
      setValue(formatted)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div className="field-type text">
      <div
        className="slug-field-wrapper"
        style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
      >
        <div style={{ flex: 1 }}>
          <label className="field-label" htmlFor={path}>
            Slug
            {required && <span className="required">*</span>}
          </label>
          <input
            id={path}
            type="text"
            value={value || ''}
            onChange={handleInputChange}
            className="input"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={handleFormatSlug}
          style={{
            whiteSpace: 'nowrap',
            padding: '8px 16px',
            fontSize: '13px',
            marginBottom: '2px',
          }}
        >
          Format Slug
        </button>
      </div>
      <div
        className="field-description"
        style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}
      >
        URL-friendly slug (lowercase, hyphens only). Click &quot;Format Slug&quot; to generate from
        name or format current value.
      </div>
    </div>
  )
}

export default SlugField
