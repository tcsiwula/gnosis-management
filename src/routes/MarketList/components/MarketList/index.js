import React, { Component } from 'react'
import { List } from 'immutable'
import PropTypes from 'prop-types'
import MarketOverview from '../MarketOverview'
import Markets from '../Markets'
import Filter from '../Filter/index'
import MarketStats from '../MarketStats'
import MarketsTitle from '../MarketsTitle'
import NoMarkets from '../NoMarkets'

// eslint-disable-next-line
class MarketList extends Component {

  constructor(props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.prompt = 'Please submit a decentralized research question below'
    this.ethAddress = this.props.userAccount
  }

  componentDidMount() {
    this.props.fetchMarkets()
  }

  submit(event) {
    let emailAddress = this.refs.emailAddress
    let comments = this.refs.comments
    console.log(ReactDOM.findDOMNode(emailAddress).value)
    console.log(ReactDOM.findDOMNode(comments).value)
  }


  render() {
    const {
      markets, openMarkets, newMarkets, endingSoonMarkets, userAccount, viewMarket,
    } = this.props


    let ethAddress = this.props.userAccount


    return (
      <div>
        {/*<p>{this.ethAddress}</p>*/}


        <div className="well">
          <p>{this.prompt}</p>
          <div className="form-group">
            Creators Ethereum Address: <input ref="emailAddress" className="form-control" type="text" placeholder={this.ethAddress}/>
          </div>
          <div className="form-group">
            Question: <textarea ref="comments" className="form-control"  placeholder="Will Ryan do start a spoke before end of Q2?"/>
          </div>
          <div className="form-group">
            <a className="btn btn-primary" value="Submit" onClick={this.submit}>Submit</a>
          </div>
        </div>





        <MarketsTitle />
        <MarketStats
          open={openMarkets}
          newMarkets={newMarkets}
          endingSoon={endingSoonMarkets}
        />
        <MarketOverview>
          <div className="col-md-9">
            { markets ? <Markets markets={markets} userAccount={userAccount} viewMarket={viewMarket} /> : <NoMarkets /> }
          </div>
          <div className="col-md-3">
            <Filter userAccount={userAccount} />
          </div>
        </MarketOverview>
      </div>
    )
  }
}


MarketList.propTypes = {
  viewMarket: PropTypes.func.isRequired,
  fetchMarkets: PropTypes.func.isRequired,
  markets: PropTypes.instanceOf(List),
  userAccount: PropTypes.string,
  openMarkets: PropTypes.number.isRequired,
  newMarkets: PropTypes.number.isRequired,
  endingSoonMarkets: PropTypes.number.isRequired,
}

MarketList.defaultProps = {
  markets: List([]),
  userAccount: undefined,
}

export default MarketList
