import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      Here&apos;s what you can do next:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' to quickly add demo data for properties, rooms, and bookings, then '}
          <a href="/" target="_blank">
            visit your website
          </a>
          {' to see your PG/Hostel/Apartment listings in action.'}
        </li>
        <li>
          Manage your property, room, and booking data directly from the 'Properties', 'Rooms', and
          'Bookings' collections in the 'admin dashboard'.
        </li>
        <li>
          {'Customize your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' and add or modify '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
        <li>
          Commit and push your changes to the repository to trigger a redeployment of your project.
        </li>
      </ul>
      {'Pro Tip: This dashboard block is a '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        custom component
      </a>
      , and you can remove or update it any time by editing <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard
