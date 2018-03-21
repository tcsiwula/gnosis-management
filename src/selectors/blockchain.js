import Decimal from 'decimal.js'
import { getTokenAddress } from 'utils/configuration'

/**
 * Returns if gnosis.js is initialized or not
 * @param {*} state - redux state
 */
export const isGnosisInitialized = state => !!state.blockchain.get('gnosisInitialized')

export const triedToConnect = state => !!state.blockchain.get('connectionTried')

export const isGasCostFetched = (state, property) => state.blockchain.getIn(['gasCosts', property]) !== undefined

export const getDefaultTokenAmount = (state) => {
  const defaultTokenAddress = getTokenAddress()
  const etherTokensAmount = state.blockchain.getIn(['tokenBalances', defaultTokenAddress], 0)
  let defaultTokenDecimal
  try {
    defaultTokenDecimal = Decimal(etherTokensAmount)
  } catch (e) {
    defaultTokenDecimal = Decimal(0)
  }

  return defaultTokenDecimal
}

export const getTokenSymbol = (state, tokenAddress) => state.blockchain.getIn(['tokenSymbols', tokenAddress])
