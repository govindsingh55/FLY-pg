import React from 'react'

interface SearchBarBlockProps {
  placeholder?: string
  showCityFilter?: boolean
}

const SearchBarBlock: React.FC<SearchBarBlockProps> = ({
  placeholder = 'Find a place near your work/study',
  showCityFilter = true,
}) => {
  // TODO: Add state and handlers for search/filter
  return (
    <section className="search-bar-block">
      <form>
        <div>custom serach box</div>
        <input type="text" placeholder={placeholder} className="search-input" />
        {showCityFilter && (
          <select className="city-filter">
            <option value="">Select City</option>
            {/* TODO: Map city options here */}
          </select>
        )}
        <button type="submit">Search</button>
      </form>
    </section>
  )
}

export default SearchBarBlock
