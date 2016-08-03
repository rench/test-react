import 'flex.css/dist/data-flex.css'; //flex 布局模块
import './less/common.less'; //自己写的公共样式

import React, {Component, PropTypes} from 'react';
import ReactDOM, {render} from 'react-dom';

import App from './App';

render(<App />, document.body.appendChild(document.createElement('div')));