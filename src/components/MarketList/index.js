import React, { Component } from 'react'
import PropTypes from 'prop-types'
import autobind from 'autobind-decorator'
import moment from 'moment'
import cn from 'classnames'
import Decimal from 'decimal.js'
import { NavLink } from 'react-router-dom'
import 'moment-duration-format'
import { reduxForm, Field } from 'redux-form'

import Countdown from 'components/Countdown'
import CurrencyName from 'components/CurrencyName'
import { decimalToText } from 'components/DecimalValue'
import Outcome from 'components/Outcome'
import {
  Checkbox,
  Select,
  TextInput,
  RadioButtonGroup,
} from 'components/Form'


import { RESOLUTION_TIME } from 'utils/constants'
import { marketShape } from 'utils/shapes'
import { isMarketClosed, isMarketResolved } from 'utils/helpers'

import './marketList.scss'

const resolutionFilters = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'Open',
    value: 'UNRESOLVED',
  },
  {
    label: 'Ended',
    value: 'RESOLVED',
  },
]

const selectFilter = [
  { value: '---', label: '---' },
  { value: 'RESOLUTION_DATE_ASC', label: 'RESOLUTION DATE ↑' },
  { value: 'RESOLUTION_DATE_DESC', label: 'RESOLUTION DATE ↓' },
  { value: 'TRADING_VOLUME_ASC', label: 'TRADING VOLUME ↑' },
  { value: 'TRADING_VOLUME_DESC', label: 'TRADING VOLUME ↓' },
]

class MarketList extends Component {
  componentWillMount() {
    this.props.fetchMarkets()
  }

  @autobind
  handleViewMarket(market) {
    this.props.changeUrl(`/markets/${market.address}`)
    window.scroll(0, 0)
  }

  @autobind
  handleViewMarketResolve(event) {
    event.stopPropagation()
  }

  @autobind
  handleCreateMarket() {
    if (this.props.defaultAccount) {
      this.props.changeUrl('/markets/new')
      window.scroll(0, 0)
    }
  }

  @autobind
  renderMarket(market) {
    const isResolved = isMarketResolved(market)
    const isClosed = isMarketClosed(market)
    const isResolvedOrClosed = isResolved || isClosed
    const isOwner = this.props.defaultAccount && market.creator === this.props.defaultAccount
    const showResolveButton = isOwner && !isResolved

    let marketStatusInfoField = (
      <div className="info_field">
        <div className="info__field--icon icon icon--countdown" />
        <div className="info__field--label">
          <Countdown target={market.eventDescription.resolutionDate} format={RESOLUTION_TIME.RELATIVE_FORMAT} />
        </div>
      </div>
    )

    if (isResolvedOrClosed) {
      const marketStatus = isResolved ? 'resolved' : 'closed'
      marketStatusInfoField = (
        <div className="info_field">
          <div className="info__field--icon icon icon--checkmark" />
          <div className="info__field--label">{marketStatus}</div>
        </div>
      )
    }

    return (
      <button
        type="button"
        className={cn({
          market,
          'market--resolved': isResolved || isClosed,
        })}
        key={market.address}
        onClick={() => this.handleViewMarket(market)}
      >
        <div className="market__header">
          <h2 className="market__title">{market.eventDescription.title}</h2>
          {showResolveButton && (
            <div className="market__control">
              <NavLink to={`/markets/${market.address}/resolve`} onClick={this.handleViewMarketResolve}>
                Resolve
              </NavLink>
            </div>
          )}
        </div>
        <Outcome market={market} />
        <div className="market__info row">
          <div className="info__group col-md-3">
            <div className="info__field">{marketStatusInfoField}</div>
          </div>
          <div className="info__group col-md-3">
            <div className="info__field">
              <div className="info__field--icon icon icon--enddate" />
              <div className="info__field--label">
                {moment(market.eventDescription.resolutionDate).format(RESOLUTION_TIME.ABSOLUTE_FORMAT)}
              </div>
            </div>
          </div>
          <div className="info__group col-md-3">
            <div className="info__field">
              <div className="info__field--icon icon icon--currency" />
              <div className="info__field--label">
                {decimalToText(new Decimal(market.tradingVolume).div(1e18))}&nbsp;
                <CurrencyName tokenAddress={market.event.collateralToken} />&nbsp; Volume
              </div>
            </div>
          </div>
        </div>
      </button>
    )
  }

  renderMarkets() {
    const { markets } = this.props

    return (
      <div className="marketList col-md-9">
        {markets.length > 0 ? (
          <div>
            <div className="marketList__title">
              Showing {markets.length} of {markets.length}
            </div>
            <div className="marketListContainer">{markets.map(this.renderMarket)}</div>
          </div>
        ) : (
          <div className="marketListContainer">
            <div className="market no-markets">No Markets available</div>
          </div>
        )}
      </div>
    )
  }

  renderMarketFilter() {
    const { handleSubmit, isModerator } = this.props

    return (
      <div className="marketFilter col-md-3">
        <form onSubmit={handleSubmit}>
          <div className="marketFilter__group">
            <Field
              component={TextInput}
              name="search"
              label="Search"
              placeholder="Title, Description"
              className="marketFilterField marketFilterSearch"
            />
          </div>
          <div className="marketFilter__group">
            <Field name="orderBy" label="Order by" component={Select} options={selectFilter} defaultValue="---" />
          </div>
          <div className="marketFilter__group">
            <Field
              name="resolved"
              label="Resolution Date"
              component={RadioButtonGroup}
              options={resolutionFilters}
              light
            />
          </div>
          {isModerator ? (
            <div className="marketFilter__group">
              <Field name="myMarkets" label="Show only" component={Checkbox} muted>My Markets</Field>
            </div>
          ) : (
            <div />
          )}
        </form>
      </div>
    )
  }

  render() {
    const { markets } = this.props

    const threeDayMSeconds = 3 * 24 * 60 * 60 * 1000
    const now = new Date()
    const openMarkets = markets.filter(market => !isMarketClosed(market) && !isMarketResolved(market))
    const openMarketsAmount = openMarkets.length
    const endingSoonMarketsAmount = openMarkets.filter(({ eventDescription: { resolutionDate } }) => new Date(resolutionDate) - now < threeDayMSeconds).length
    const newMarketsAmount = openMarkets.filter(({ creationDate }) => now - new Date(creationDate) < threeDayMSeconds)
      .length

    return (
      <div className="marketListPage">
        <div className="marketListPage__header">
          <div className="container">
            <h3>Market overview meowwww</h3>




          </div>

        </div>
        <div className="marketListPage__stats">
          <div className="container">
            <div className="row marketStats">
              <div className="col-xs-10 col-xs-offset-1 col-sm-4 col-sm-offset-0 marketStats__stat">
                <div className="marketStats__icon icon icon--market" />
                <span className="marketStats__value">{openMarketsAmount}</span>
                <div className="marketStats__label">Open Markets</div>
              </div>
              <div className="col-xs-10 col-xs-offset-1 col-sm-4 col-sm-offset-0 marketStats__stat">
                <div className="marketStats__icon icon icon--market--countdown" />
                <span className="marketStats__value">{endingSoonMarketsAmount}</span>
                <div className="marketStats__label">Ending Soon</div>
              </div>
              <div className="col-xs-10 col-xs-offset-1 col-sm-4 col-sm-offset-0 marketStats__stat">
                <div className="marketStats__icon icon icon--new" />
                <span className="marketStats__value">{newMarketsAmount}</span>
                <div className="marketStats__label">New Markets</div>
              </div>
            </div>
          </div>
        </div>
        <div className="marketListPage__markets">
          <div className="container">
            <div className="row">
              {this.renderMarkets()}
              {this.renderMarketFilter()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

MarketList.propTypes = {
  markets: PropTypes.arrayOf(marketShape),
  defaultAccount: PropTypes.string,
  fetchMarkets: PropTypes.func,
  changeUrl: PropTypes.func,
  handleSubmit: PropTypes.func,
  isModerator: PropTypes.bool,
}

export default reduxForm({
  form: 'marketListFilter',
})(MarketList)
