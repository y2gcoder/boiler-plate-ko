import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import 'antd/dist/antd.css'
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk'
import Reducer from './_reducers'
//원래는 createStore만 하지만 promise와 function도 같이 받게 하기 위해!
const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);
//react-redux를 이용해 provider로 감싸줌.
ReactDOM.render(
  <Provider
    store={createStoreWithMiddleware(Reducer, 
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()  
    )}
  >
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
