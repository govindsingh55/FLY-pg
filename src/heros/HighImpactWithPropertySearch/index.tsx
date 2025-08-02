'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Input } from '@/components/ui/input'
import { useQueryState } from 'nuqs'

export const HighImpactWithPropertySearch: React.FC<Page['hero']> = ({ media, richText }) => {
  return (
    <div className="flex items-center justify-center text-white">
      <div className="container mb-8 flex gap-10 items-center justify-between">
        <div className="flex-1 flex flex-col ">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          <Search />
        </div>
        <div className="flex-1 hidden md:block">
          <Media imgClassName="object-cover" priority resource={media} />
        </div>
      </div>
    </div>
  )
}

function Search() {
  const [search] = useQueryState('search')
  const [_, setSearchDrawerOpen] = useQueryState('searchDrawerOpen')
  return (
    <div className="flex items-center justify-center">
      <Input
        id="search"
        onClick={() => setSearchDrawerOpen('true')}
        value={search || ''}
        placeholder="Search"
        readOnly
      />
    </div>
  )
}
