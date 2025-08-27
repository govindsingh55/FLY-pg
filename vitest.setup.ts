// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Setup jest-dom for custom matchers
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
