import React, { Component } from "react";
import "./App.css";

import config from "./config";
import { load } from "./helpers/spreadsheet";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSignedIn: null,
      data: [],
    }

    this.handleAuthRequest = this.handleAuthRequest.bind(this);
  }

  componentDidMount() {
    // 1. Load the JavaScript client library.
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient = () => {
    // 2. Initialize the JavaScript client library.
    window.gapi.client
      .init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        // Your API key will be automatically added to the Discovery Document URLs.
        discoveryDocs: config.discoveryDocs,
        scope: config.scopes
      })
      .then(() => {
        // Listen for sign-in state changes.
        window.gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen(this.updateSigninStatus);
        // Handle the initial sign-in state.
        this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      });
  };

  updateSigninStatus = isSignedIn => {
    this.setState({ isSignedIn });

    if (isSignedIn) {
      // 3. Initialize and make the API request.
      load(this.onLoad);
    }
  };

  onLoad = (data, error) => {
    if (data) {
      this.setState({ data });
    } else {
      this.setState({ error });
    }
  };

  handleAuthRequest() {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  handleSignoutRequest(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  render() {
    const { isSignedIn, data } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">R/GA Books</h1>
        </header>
        <main className="App-main">
          {isSignedIn === false && <button onClick={this.handleAuthRequest}>Sign In</button>}
          {data.map((book, index) => (<p key={book.id || index}>{book.title}</p>))}
          {isSignedIn === true && <button onClick={this.handleSignoutRequest}>Sign Out</button>}
        </main>
      </div>
    );
  }
}

export default App;
