import React, { Component } from 'react';
import { connect } from 'react-redux';
import ChefPastEntry from './chefPastEntry';
import { ChefPastFunc, EventIdFunc } from '../actions/index';

class ChefPast extends Component {

  componentDidMount() {
    this.props.ChefPastFunc();
  }

  clicked(asdf) {
    console.log(asdf);
  }

  renderList() {
    console.log('PROOOOOOOOPS: ', this.props);
    if (this.props.chefPastEvents === undefined) {
      return (
        <div>
        </div>
      );
    }
    return this.props.chefPastEvents.map((pastEvent) => {
      return (
        <ChefPastEntry
          eventName={pastEvent.eventName}
          eventId={pastEvent.id}
          clicked={this.props.EventIdFunc}
        />
      );
    });
  }

  render() {
    return (
      <div className="row">
        {this.renderList()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    chefPastEvents: state.chefEvents.chefPastEvents,
  };
}

export default connect(mapStateToProps, { ChefPastFunc, EventIdFunc })(ChefPast);
