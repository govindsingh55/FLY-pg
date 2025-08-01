// Seed data for FoodMenu collection
type Direction = 'ltr' | 'rtl' | null
type Format = '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'

interface FoodMenuSeed {
  name: string
  description: {
    root: {
      type: 'root'
      children: Array<{
        type: 'paragraph'
        version: number
        children: Array<{ text: string; type: 'text'; version: number }>
      }>
      direction: Direction
      format: Format
      indent: number
      version: number
    }
  }
}

const foodMenuSeed: FoodMenuSeed[] = [
  {
    name: 'Breakfast Combo',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [{ text: 'Eggs, toast, and juice', type: 'text', version: 1 }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  {
    name: 'Lunch Special',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [{ text: 'Rice, dal, and curry', type: 'text', version: 1 }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
]
export default foodMenuSeed
