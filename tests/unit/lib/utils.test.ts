import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class')
      expect(result).toBe('base-class active-class')
    })

    it('should filter out falsy values', () => {
      const result = cn('base-class', false, null, undefined, '', 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn('base-class', ['class1', 'class2'], 'class3')
      expect(result).toBe('base-class class1 class2 class3')
    })

    it('should handle objects with conditional classes', () => {
      const result = cn('base-class', {
        'active-class': true,
        'inactive-class': false,
        'conditional-class': true,
      })
      expect(result).toBe('base-class active-class conditional-class')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base-class',
        'static-class',
        ['array-class1', 'array-class2'],
        {
          'object-class': true,
          'object-false': false,
        },
        false && 'conditional-false',
        true && 'conditional-true',
      )
      expect(result).toBe(
        'base-class static-class array-class1 array-class2 object-class conditional-true',
      )
    })

    it('should return empty string for no input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle single class', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })
  })
})
