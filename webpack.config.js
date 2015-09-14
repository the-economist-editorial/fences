var webpack = require('webpack');

module.exports = {
  cache : true,
  entry : {
    app : './js/init.js'
  },
  output : {
    path : './built',
    filename : 'dist.js'
  },
  module : {
    loaders : [
      {
        test : /\.(js|jsx)$/,
        loader : 'babel?optional[]=runtime'
      }
    ]
  },
  resolve : {
    extensions : ['', '.js', '.json', '.jsx'],
    alias : {
      // react : 'react'
    }
  }
};
