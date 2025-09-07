// Property-specific blocks for the Pages collection
export const propertyBlocks = [
  {
    slug: 'property-carousel',
    labels: {
      singular: 'Property Carousel Section',
      plural: 'Property Carousel Sections',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Section Title',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'text',
        label: 'Section Subtitle',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
      },
      {
        name: 'showAllProperties',
        type: 'checkbox',
        label: 'Show All Properties',
        defaultValue: true,
        admin: {
          description: 'If enabled, will automatically fetch and display all active properties',
        },
      },
      {
        name: 'selectedProperties',
        type: 'relationship',
        relationTo: 'properties',
        hasMany: true,
        admin: {
          condition: (data: any) => !data.showAllProperties,
          description:
            'Select specific properties to display (only used if "Show All Properties" is disabled)',
        },
      },
      {
        name: 'maxProperties',
        type: 'number',
        label: 'Maximum Properties to Show',
        defaultValue: 10,
        admin: {
          description: 'Limit the number of properties displayed',
        },
      },
      {
        name: 'showFilters',
        type: 'checkbox',
        label: 'Show Property Filters',
        defaultValue: false,
      },
      {
        name: 'showViewAllButton',
        type: 'checkbox',
        label: 'Show "View All" Button',
        defaultValue: true,
      },
      {
        name: 'viewAllButtonText',
        type: 'text',
        label: 'View All Button Text',
        defaultValue: 'View All Properties',
      },
      {
        name: 'viewAllButtonUrl',
        type: 'text',
        label: 'View All Button URL',
        defaultValue: '/properties',
      },
      // Enhanced styling options
      {
        name: 'backgroundColor',
        type: 'select',
        label: 'Background Color',
        options: [
          { label: 'Transparent', value: 'transparent' },
          { label: 'Background', value: 'background' },
          { label: 'Muted', value: 'muted' },
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
        defaultValue: 'transparent',
      },
      {
        name: 'textAlignment',
        type: 'select',
        label: 'Text Alignment',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      },
      {
        name: 'padding',
        type: 'select',
        label: 'Section Padding',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Default', value: 'default' },
          { label: 'Large', value: 'large' },
          { label: 'Extra Large', value: 'xl' },
        ],
        defaultValue: 'default',
      },
      {
        name: 'maxWidth',
        type: 'select',
        label: 'Max Width',
        options: [
          { label: 'Narrow', value: 'narrow' },
          { label: 'Default', value: 'default' },
          { label: 'Wide', value: 'wide' },
          { label: 'Full', value: 'full' },
        ],
        defaultValue: 'default',
      },
    ],
  },
  {
    slug: 'property-search',
    labels: {
      singular: 'Property Search Section',
      plural: 'Property Search Sections',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Section Title',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'text',
        label: 'Section Subtitle',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
      },
      {
        name: 'searchPlaceholder',
        type: 'text',
        label: 'Search Input Placeholder',
        defaultValue: 'Search by location, property name...',
      },
      {
        name: 'showFilters',
        type: 'checkbox',
        label: 'Show Advanced Filters',
        defaultValue: true,
      },
      {
        name: 'showPropertyTypes',
        type: 'checkbox',
        label: 'Show Property Type Filter',
        defaultValue: true,
      },
      {
        name: 'showGenderTypes',
        type: 'checkbox',
        label: 'Show Gender Type Filter',
        defaultValue: true,
      },
      {
        name: 'showPriceRange',
        type: 'checkbox',
        label: 'Show Price Range Filter',
        defaultValue: true,
      },
      {
        name: 'showAmenities',
        type: 'checkbox',
        label: 'Show Amenities Filter',
        defaultValue: true,
      },
      {
        name: 'searchButtonText',
        type: 'text',
        label: 'Search Button Text',
        defaultValue: 'Search Properties',
      },
      {
        name: 'searchResultsUrl',
        type: 'text',
        label: 'Search Results URL',
        defaultValue: '/properties',
      },
      // Enhanced styling options
      {
        name: 'backgroundColor',
        type: 'select',
        label: 'Background Color',
        options: [
          { label: 'Transparent', value: 'transparent' },
          { label: 'Background', value: 'background' },
          { label: 'Muted', value: 'muted' },
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
        defaultValue: 'primary',
      },
      {
        name: 'textAlignment',
        type: 'select',
        label: 'Text Alignment',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      },
      {
        name: 'padding',
        type: 'select',
        label: 'Section Padding',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Default', value: 'default' },
          { label: 'Large', value: 'large' },
          { label: 'Extra Large', value: 'xl' },
        ],
        defaultValue: 'large',
      },
      {
        name: 'maxWidth',
        type: 'select',
        label: 'Max Width',
        options: [
          { label: 'Narrow', value: 'narrow' },
          { label: 'Default', value: 'default' },
          { label: 'Wide', value: 'wide' },
          { label: 'Full', value: 'full' },
        ],
        defaultValue: 'default',
      },
      {
        name: 'backgroundImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Background Image',
      },
      {
        name: 'overlayOpacity',
        type: 'select',
        label: 'Overlay Opacity',
        options: [
          { label: 'Light (20%)', value: 'light' },
          { label: 'Medium (40%)', value: 'medium' },
          { label: 'Dark (60%)', value: 'dark' },
          { label: 'Heavy (80%)', value: 'heavy' },
        ],
        defaultValue: 'medium',
      },
    ],
  },
  {
    slug: 'property-listing',
    labels: {
      singular: 'Property Listing Section',
      plural: 'Property Listing Sections',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Section Title',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'text',
        label: 'Section Subtitle',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
      },
      {
        name: 'showAllProperties',
        type: 'checkbox',
        label: 'Show All Properties',
        defaultValue: true,
        admin: {
          description: 'If enabled, will automatically fetch and display all active properties',
        },
      },
      {
        name: 'selectedProperties',
        type: 'relationship',
        relationTo: 'properties',
        hasMany: true,
        admin: {
          condition: (data: any) => !data.showAllProperties,
          description:
            'Select specific properties to display (only used if "Show All Properties" is disabled)',
        },
      },
      {
        name: 'maxProperties',
        type: 'number',
        label: 'Maximum Properties to Show',
        defaultValue: 6,
        admin: {
          description: 'Limit the number of properties displayed',
        },
      },
      {
        name: 'layout',
        type: 'select',
        label: 'Layout Style',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'List', value: 'list' },
          { label: 'Masonry', value: 'masonry' },
        ],
        defaultValue: 'grid',
      },
      {
        name: 'columns',
        type: 'select',
        label: 'Grid Columns',
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        defaultValue: '3',
        admin: {
          condition: (data: any) => data.layout === 'grid',
        },
      },
      {
        name: 'showFilters',
        type: 'checkbox',
        label: 'Show Property Filters',
        defaultValue: false,
      },
      {
        name: 'showPagination',
        type: 'checkbox',
        label: 'Show Pagination',
        defaultValue: false,
      },
      {
        name: 'showViewAllButton',
        type: 'checkbox',
        label: 'Show "View All" Button',
        defaultValue: true,
      },
      {
        name: 'viewAllButtonText',
        type: 'text',
        label: 'View All Button Text',
        defaultValue: 'View All Properties',
      },
      {
        name: 'viewAllButtonUrl',
        type: 'text',
        label: 'View All Button URL',
        defaultValue: '/properties',
      },
      // Enhanced styling options
      {
        name: 'backgroundColor',
        type: 'select',
        label: 'Background Color',
        options: [
          { label: 'Transparent', value: 'transparent' },
          { label: 'Background', value: 'background' },
          { label: 'Muted', value: 'muted' },
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ],
        defaultValue: 'transparent',
      },
      {
        name: 'textAlignment',
        type: 'select',
        label: 'Text Alignment',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      },
      {
        name: 'padding',
        type: 'select',
        label: 'Section Padding',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Default', value: 'default' },
          { label: 'Large', value: 'large' },
          { label: 'Extra Large', value: 'xl' },
        ],
        defaultValue: 'default',
      },
      {
        name: 'maxWidth',
        type: 'select',
        label: 'Max Width',
        options: [
          { label: 'Narrow', value: 'narrow' },
          { label: 'Default', value: 'default' },
          { label: 'Wide', value: 'wide' },
          { label: 'Full', value: 'full' },
        ],
        defaultValue: 'default',
      },
    ],
  },
]
