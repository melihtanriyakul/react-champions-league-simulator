import React, { Component } from 'react';
import League from './League';

class App extends Component {
  constructor(props) {
    super(props);
    this.teams = {
      "Barcelona" : 1.8,
      "Liverpool" : 1.2,
      "Juventus" : 1.3,
      "Bayern Munich" : 1.6,
    }
  }


  render() {
    return (
      <League teams={this.teams}/>
    );
  }
}

export default App;
