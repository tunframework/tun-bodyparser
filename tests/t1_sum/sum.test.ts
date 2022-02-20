import assert from 'assert'
import { sum } from './sum.js'

describe(`#sum`, () => {
  it(`sum 1 + 2 should equals 3`, () => {
    assert.equal(sum(1, 2), 3)
  })
})
