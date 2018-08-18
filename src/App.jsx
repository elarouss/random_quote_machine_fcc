import axios from 'axios';
import React, {Component } from 'react';
import {createStore, applyMiddleware} from 'redux';
import {connect,Provider} from 'react-redux';
import thunk from 'redux-thunk';
import posed from 'react-pose';
import './App.css';

const config = {
  visible: {
    opacity: 1
  },hidden: {
    opacity: 0
  }

}

const Box = posed.div(config);

// Redux
const SHOW_QUOTE = 'SHOW_QUOTE';
const GET_QUOTE  = 'GET_QUOTE';
const LOADING_QUOTE = 'LOADING_QUOTE';
const QUOTE_LOADED = 'QUOTE_LOADED';

const showQuote = (quote) => {
  return {
    type: SHOW_QUOTE,
    quote
  }
};


const getNewQuote = () => {
  return dispatch => {
    dispatch({type : LOADING_QUOTE});
    axios.get('https://talaikis.com/api/quotes/random/')
      .then((resp) => {
        console.log(resp);
        const quote = resp.data;
        dispatch({type : QUOTE_LOADED});
        dispatch({type: SHOW_QUOTE,
                  quote: {content: quote.quote,
                          author: quote.author}});
      })
      .catch((err) => console.log("Error : ",err))
      .then(() => console.log("REQUEST END"));
  };
};


const defaultState = {loading: false,
                      quote :{author: "",content: ""}};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SHOW_QUOTE:
      return {loading: state.loading,
              quote : action.quote};
    case LOADING_QUOTE :
      let loadingState = Object.assign({},state);
      loadingState.loading = true;
      return loadingState;
    case QUOTE_LOADED :
      let loadedState = Object.assign({},state);
      loadedState.loading = false;
      return loadedState;
    default:
      return state;
  }
}

const store = createStore(reducer,applyMiddleware(thunk));



class QuoteBox extends Component {
    constructor(props){
      super(props);
    }

    render(){
      const loader = (
        <div id="overlay">
          <div id="loader"></div>
        </div>);
      return (
        <div id="quote-box">
          <div id="text">{this.props.text}</div>
          <div id="author">-{this.props.author}</div>
          <div id="links">
            <a id="new-quote" href="#" onClick={this.props.getNewQuote}>New Quote</a>
            <a id="tweet-quote" href={"https://www.twitter.com/intent/tweet?text=" + this.props.text}>Tweet Quote</a>
          </div>
          {this.props.loading && loader}
        </div>
      );
    }
}

class Presentational extends Component {
  constructor(props){
    super(props);
  }

  render(){
    const quote = this.props.quote;
    return(
      <main id="container">
        <header id="header">Random Quote Generator Machine</header>
        <Box pose={this.props.loading? 'hidden': 'visible'}>
        <QuoteBox text={quote.content}
           author={quote.author}
          getNewQuote={this.props.getNewQuote}
          loading= {this.props.loading} />
        </Box>
        <footer id="footer">
          by <a href="https://www.github.com/elarouss">Oussama El Arbaoui</a>
         &copy; 2018
        </footer>
      </main>
    );
  }
}

const mapStatetoProps = (state) => {
  return {quote: state.quote, loading : state.loading};
};

const mapDispatchToProps = (dispatch) => {
  return {
    showNewQuote: (quote) => {
      dispatch(showQuote(quote))
    },
    getNewQuote: () => {
      dispatch(getNewQuote());
    }
  };
};

const Container = connect(mapStatetoProps,mapDispatchToProps)(Presentational);

class App extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Provider store={store}>
        <Container />
      </Provider>
    );
  }
}

store.dispatch(getNewQuote())

export default App;
