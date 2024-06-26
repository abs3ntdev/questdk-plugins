import { Address } from 'viem'
import { Chains } from './chain-ids'

export const RELAYER_ADDRESSES: { [chain in Chains]?: Address } = {
  [Chains.ETHEREUM]: '0x902F09715B6303d4173037652FA7377e5b98089E',
  [Chains.OPTIMISM]: '0x81E792e5a9003CC1C8BF5569A00f34b65d75b017',
  [Chains.BINANCE_SMART_CHAIN]: '0xA27A2cA24DD28Ce14Fb5f5844b59851F03DCf182',
  [Chains.GNOSIS]: '0x5B19bd330A84c049b62D5B0FC2bA120217a18C1C',
  [Chains.POLYGON_POS]: '0x75dC8e5F50C8221a82CA6aF64aF811caA983B65f',
  [Chains.MANTLE]: '0xcb566e3B6934Fa77258d68ea18E931fa75e1aaAa',
  [Chains.BASE]: '0xcb566e3B6934Fa77258d68ea18E931fa75e1aaAa',
  [Chains.ARBITRUM_ONE]: '0x177d36dBE2271A4DdB2Ad8304d82628eb921d790',
  [Chains.AVALANCHE]: '0xCD2E3622d483C7Dc855F72e5eafAdCD577ac78B4',
  [Chains.ZORA]: '0xA658742d33ebd2ce2F0bdFf73515Aa797Fd161D9',
}
