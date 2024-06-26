import {
  CAMELOT_V2_ABI,
  CAMELOT_V3_EXACT_INPUT_ABI,
  CAMELOT_V3_EXACT_OUTPUT_ABI,
  PARASWAP_ABI,
  YAK_ROUTER_ABI,
} from './abi'
import { CHAIN_ID_ARRAY } from './chain-ids'
import {
  CAMELOT_V2_ROUTER,
  CAMELOT_V3_ROUTER,
  DEFAULT_TOKEN_LIST,
  INTERNAL_ETH_ADDRESS,
  PARASWAP_ROUTER,
  YAK_ROUTER,
} from './contract-addresses'
import { Tokens, buildV2PathQuery, buildV3PathQuery } from './utils'
import {
  type SwapActionParams,
  type TransactionFilter,
  compressJson,
} from '@rabbitholegg/questdk'
import { Chains } from '@rabbitholegg/questdk-plugin-utils'
import { type Address } from 'viem'

const PARASWAP_PARTNER = '0x353D2d14Bb674892910685520Ac040f560CcBC06'

export const swap = async (
  swap: SwapActionParams,
): Promise<TransactionFilter> => {
  const { chainId, tokenIn, tokenOut, amountIn, amountOut, recipient } = swap

  const ethUsedIn = tokenIn === Tokens.ETH
  const ethUsedOut = tokenOut === Tokens.ETH

  const tokenInOrEth = ethUsedIn ? INTERNAL_ETH_ADDRESS : tokenIn
  const tokenOutOrEth = ethUsedOut ? INTERNAL_ETH_ADDRESS : tokenOut
  const tokenInOrWeth = ethUsedIn ? Tokens.WETH : tokenIn
  const tokenOutOrWeth = ethUsedOut ? Tokens.WETH : tokenOut

  return compressJson({
    chainId: chainId,
    from: recipient,
    to: {
      $or: [
        CAMELOT_V2_ROUTER.toLowerCase(),
        CAMELOT_V3_ROUTER.toLowerCase(),
        PARASWAP_ROUTER.toLowerCase(),
        YAK_ROUTER.toLowerCase(),
      ],
    },
    value: ethUsedIn ? amountIn : undefined,
    input: {
      $or: [
        {
          // camelotV2 swap
          $abi: CAMELOT_V2_ABI,
          path: buildV2PathQuery(tokenInOrWeth, tokenOutOrWeth),
          amountOutMin: amountOut,
          amountIn: ethUsedIn ? undefined : amountIn,
        },
        {
          // camelotV3 swap
          $or: [
            {
              $abiAbstract: CAMELOT_V3_EXACT_OUTPUT_ABI,
              params: {
                $or: [
                  {
                    tokenIn: tokenInOrWeth,
                    tokenOut: tokenOutOrWeth,
                  },
                  {
                    // exact output has the reverse structure (tokenOut first)
                    path: buildV3PathQuery(tokenOutOrWeth, tokenInOrWeth),
                  },
                ],
                amountInMaximum: amountIn,
                amountOut,
              },
            },
            {
              $abiAbstract: CAMELOT_V3_EXACT_INPUT_ABI,
              params: {
                $or: [
                  {
                    tokenIn: tokenInOrWeth,
                    tokenOut: tokenOutOrWeth,
                  },
                  {
                    path: buildV3PathQuery(tokenInOrWeth, tokenOutOrWeth),
                  },
                ],
                amountIn,
                amountOutMinimum: amountOut,
              },
            },
          ],
        },
        {
          // paraswap
          $abi: PARASWAP_ABI,
          $or: [
            {
              // simpleswap, directUniV3Swap, directCurveSwap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                toToken: tokenOutOrEth,
                partner: PARASWAP_PARTNER,
              },
            },
            {
              // multiswap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                path: {
                  $last: {
                    to: tokenOutOrEth,
                  },
                },
                partner: PARASWAP_PARTNER,
              },
            },
            {
              // megaswap
              data: {
                fromToken: tokenInOrEth,
                fromAmount: amountIn,
                toAmount: amountOut,
                path: {
                  $last: {
                    path: {
                      $last: {
                        to: tokenOutOrEth,
                      },
                    },
                  },
                },
                partner: PARASWAP_PARTNER,
              },
            },
            {
              // directBalancerV2
              data: {
                assets: buildV2PathQuery(tokenIn, tokenOut),
                fromAmount: amountIn,
                toAmount: amountOut,
                partner: PARASWAP_PARTNER,
              },
            },
          ],
        },
        {
          $abi: YAK_ROUTER_ABI,
          _trade: {
            amountIn: amountIn,
            amountOut: amountOut,
            path: buildV2PathQuery(tokenInOrWeth, tokenOutOrWeth),
          },
          _to: recipient,
        },
      ],
    },
  })
}

export const getSupportedTokenAddresses = async (
  _chainId: number,
): Promise<Address[]> => {
  // Only return supported tokens for ARBITRUM_CHAIN_ID
  return _chainId === Chains.ARBITRUM_ONE ? DEFAULT_TOKEN_LIST : []
}

export const getSupportedChainIds = async (): Promise<number[]> => {
  return CHAIN_ID_ARRAY
}
