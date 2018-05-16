import React, { Component } from "react";
import "./App.css";

import config from "./config";
import { load } from "./helpers/spreadsheet";

const INITIAL_STATE = {
  isSignedIn: null,
  data: [],
  disciplines: [],
  filter: ""
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...INITIAL_STATE,
    };

    this.handleAuthRequest = this.handleAuthRequest.bind(this);
    this.handleSignoutRequest = this.handleSignoutRequest.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
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
        this.updateSigninStatus(
          window.gapi.auth2.getAuthInstance().isSignedIn.get()
        );
      });
  };

  updateSigninStatus = isSignedIn => {
    if (isSignedIn) {
      this.setState({
        isSignedIn: true,
      });
      // 3. Initialize and make the API request.
      load(this.onLoad);
    } else {
      this.logOut();
    }
  };

  onLoad = (data, error) => {
    if (data) {
      this.handleData(data);
    } else {
      this.setState({ error });
    }
  };

  logOut() {
    this.setState({
      ...INITIAL_STATE,
      isSignedIn: false,
    })
  }

  handleFilterChange(event) {
    this.setState({ filter: event.target.value });
  }

  handleData(data) {
    const disciplines = data
      .map(d => d.discipline)
      .filter((value, index, self) => self.indexOf(value) === index);

    this.setState({ data, disciplines });
  }

  handleAuthRequest() {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  handleSignoutRequest(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  _renderFilteredBooks(books, filter) {
    return books
      .filter(book => !filter || book.discipline === filter)
      .map((book, index) => <p key={book.id || index}>{book.title}</p>);
  }

  render() {
    const { isSignedIn, data, filter, disciplines } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">R/GA Books</h1>
        </header>
        <main className="App-main">
          {isSignedIn === false && (
            <button onClick={this.handleAuthRequest}>Sign In</button>
          )}
          {!!disciplines.length && (
            <form>
              <label>
                Filter:
                <select
                  value={this.state.filter}
                  onChange={this.handleFilterChange}
                >
                  <option value="">All</option>
                  {disciplines.map(d => <option value={d}>{d}</option>)}
                </select>
              </label>
            </form>
          )}
          {!!data.length && this._renderFilteredBooks(data, filter)}
          {isSignedIn === true && (
            <button onClick={this.handleSignoutRequest}>Sign Out</button>
          )}
        </main>
      </div>
    );
  }
}

export default App;
