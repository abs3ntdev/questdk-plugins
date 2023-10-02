import { apply } from '@rabbitholegg/questdk/filter'
import { describe, expect, test } from 'vitest'
import { TALLY_ABI } from './abi.js'
import { ARB_ONE_CHAIN_ID } from './chain-ids.js'
import { TALLY_TOKENS } from './token-addresses.js'
import { delegate } from './Tally.js'
import { ARBITRUM_DELEGATION } from './test-transactions.js'
const TEST_ADDRESS = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'
const TEST_PROJECT = TALLY_TOKENS[ARB_ONE_CHAIN_ID][0]
// Replace *project* with the name of the project
describe('Given the tally plugin', () => {
  describe('When handling the delegate', () => {
    test('should return a valid action filter', async () => {
      const filter = await delegate({
        chainId: ARB_ONE_CHAIN_ID,
        delegatee: TEST_ADDRESS,
        project: TEST_PROJECT,
      })
      expect(filter).to.deep.equal({
        chainId: ARB_ONE_CHAIN_ID,
        to: TEST_PROJECT,
        input: {
          $abi: TALLY_ABI,
          delegatee: TEST_ADDRESS,
        },
      })
    })

    test('should pass filter with valid transactions', async () => {
      const transaction = ARBITRUM_DELEGATION
      const filter = apply(
        await delegate({
          chainId: ARB_ONE_CHAIN_ID,
          delegatee: '0x3f9e3fbbbe967481222ddaa98e84470d7099381f',
          project: TEST_PROJECT,
        }),
        transaction,
      )
      expect(filter).to.equal(true)
    })

    test('should not pass filter with invalid transactions', async () => {
      const transaction = ARBITRUM_DELEGATION
      const filter = apply(
        await delegate({
          chainId: ARB_ONE_CHAIN_ID,
          delegatee: TEST_ADDRESS,
          project: TEST_PROJECT,
        }),
        transaction,
      )
      expect(filter).to.equal(true)
    })
  })
})
