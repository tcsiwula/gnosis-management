import { List } from 'immutable'
import { requestFromRestAPI } from 'api/utils/fetch'
import { hexWithoutPrefix } from 'utils/helpers'
import { getConfiguration } from 'utils/features'
import { OUTCOME_TYPES } from 'utils/constants'
import { BoundsRecord, CategoricalMarketRecord, ScalarMarketRecord, OutcomeRecord } from 'store/models'
import addMarkets from './addMarkets'

// TODO The default assignment is because JEST test do not work out of the box
// with ENV variables. Fix that using the plugin dotenv(for example)
const config = getConfiguration()
const whitelisted = config.whitelist || {}
const addresses = Object.keys(whitelisted).map(address => hexWithoutPrefix(address))

const buildOutcomesFrom = (outcomes, outcomeTokensSold, marginalPrices) => {
  if (!outcomes) {
    return List([])
  }

  const outcomesRecords = outcomes.map((outcome, index) => new OutcomeRecord({
    name: outcome,
    marginalPrice: marginalPrices[index],
    outcomeTokensSold: outcomeTokensSold[index],
  }))

  return List(outcomesRecords)
}

const buildBoundsFrom = (lower, upper, unit, decimals) => BoundsRecord({
  lower, upper, unit, decimals: parseInt(decimals, 10),
})

const buildScalarMarket = (market) => {
  const {
    stage,
    contract: {
      address,
      creationDate,
      creator,
    },
    tradingVolume,
    funding,
    netOutcomeTokensSold,
    event: {
      type,
      collateralToken,
      lowerBound,
      upperBound,
      oracle: {
        isOutcomeSet,
        outcome,
        eventDescription: {
          title,
          description,
          resolutionDate,
          unit,
          decimals,
        },
      },
    },
  } = market

  const outcomesResponse = ['SHORT', 'LONG']

  const outcomes = buildOutcomesFrom(outcomesResponse, netOutcomeTokensSold, market.marginalPrices)
  const bounds = buildBoundsFrom(lowerBound, upperBound, unit, decimals)

  const marketRecord = new ScalarMarketRecord({
    title,
    description,
    creator,
    collateralToken,
    address,
    stage,
    type,
    outcomes,
    bounds,
    resolution: resolutionDate,
    creation: creationDate,
    volume: tradingVolume,
    resolved: isOutcomeSet,
    winningOutcome: outcome,
    funding: funding || 0,
    outcomeTokensSold: List(netOutcomeTokensSold),
  })

  return marketRecord
}

const buildCategoricalMarket = (market) => {
  const {
    stage,
    contract: { address, creationDate, creator },
    tradingVolume,
    funding,
    netOutcomeTokensSold,
    event: {
      collateralToken,
      oracle: {
        isOutcomeSet,
        outcome: winningOutcomeIndex,
        eventDescription: {
          title,
          description,
          resolutionDate,
          outcomes: outcomeLabels,
        },
      },
    },
  } = market

  const outcomes = buildOutcomesFrom(outcomeLabels, netOutcomeTokensSold, market.marginalPrices)

  const marketRecord = new CategoricalMarketRecord({
    title,
    description,
    creator,
    collateralToken,
    address,
    stage,
    outcomes,
    resolution: resolutionDate,
    creation: creationDate,
    volume: tradingVolume,
    resolved: isOutcomeSet,
    funding: funding || 0,
    winningOutcome: outcomes.get(winningOutcomeIndex),
    outcomeTokensSold: List(netOutcomeTokensSold),
  })

  return marketRecord
}

const builderFunctions = {
  [OUTCOME_TYPES.CATEGORICAL]: buildCategoricalMarket,
  [OUTCOME_TYPES.SCALAR]: buildScalarMarket,
}

export const extractMarkets = markets => markets.map((market) => {
  const marketType = market.event.type

  const builder = builderFunctions[marketType]

  if (!builder) {
    throw new Error(`No builder function associated with type '${marketType}'`)
  }

  return builder.call(builder, market)
})


export const processMarketResponse = (dispatch, response) => {
  if (!response || !response.results) {
    dispatch(addMarkets([]))
    return
  }

  const marketRecords = extractMarkets(response.results)
  dispatch(addMarkets(marketRecords))
}

export default () => dispatch =>
  requestFromRestAPI('markets', { creator: addresses.join() })
    .then(response => processMarketResponse(dispatch, response))


