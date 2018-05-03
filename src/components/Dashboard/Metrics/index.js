import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import selector from './selector'
import Layout from './Layout'

class Metrics extends React.PureComponent {
  static propTypes = {
    predictedProfit: PropTypes.string,
    tokens: PropTypes.string,
    tokenSymbol: PropTypes.string,
    tokenIcon: PropTypes.string,
    rank: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    badge: PropTypes.shape({
      icon: PropTypes.string,
      maxPredictions: PropTypes.number,
      minPredictions: PropTypes.number,
      rank: PropTypes.string,
    }),
  }

  static defaultProps = {
    predictedProfit: '0',
    tokens: '0',
    tokenSymbol: '',
    tokenIcon: 'default: tokenIcon',
    rank: '',
    badge: {},
  }

  render() {
    const {
      predictedProfit, tokens, tokenSymbol, tokenIcon, rank, badge,
    } = this.props
    return (
      <Layout
        tokens={tokens}
        predictedProfit={predictedProfit}
        tokenSymbol={tokenSymbol}
        tokenIcon={tokenIcon}
        rank={rank}
        badge={badge}
      />
    )
  }
}

export default connect(selector)(Metrics)
