import { Block } from 'payload'

const SearchBar: Block = {
  slug: 'searchBar',
  labels: {
    singular: 'Search Bar',
    plural: 'Search Bars',
  },
  fields: [
    {
      name: 'placeholder',
      type: 'text',
      label: 'Search Placeholder',
      defaultValue: 'Find a place near your work/study',
      required: false,
    },
    {
      name: 'showCityFilter',
      type: 'checkbox',
      label: 'Show City Filter',
      defaultValue: true,
    },
    // Add more config fields as needed
  ],
}

export default SearchBar
