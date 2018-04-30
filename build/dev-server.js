require('./check-versions')()

var axios = require('axios');
axios.defaults.headers.common['Content-type'] = 'application/vnd.api+json';

var config = require('../config')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

if (!process.env.WORK_ORDER_URL) {
  process.env.WORK_ORDER_URL = JSON.parse(config.dev.env.WORK_ORDER_URL)
}

if (!process.env.ROOT_PATH) {
  process.env.ROOT_PATH = JSON.parse(config.dev.env.ROOT_PATH)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production')
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
app.put(`${process.env.ROOT_PATH}/jobs/:job_id/start`, (req, res) => {
  return axios({
    method: 'put',
    url: `${process.env.WORK_ORDER_URL}/api/v1/jobs/${req.params.job_id}/start`,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })
  .then((response) => {
    return res.json(response.data);
  }).catch((error) => {
    return res.json({error: 'There has been a problem.'});
  })
});

app.put(`${process.env.ROOT_PATH}/jobs/:job_id/complete`, (req, res) => {
  res.json({message: 'Completed job in SS'});
});
app.put(`${process.env.ROOT_PATH}/jobs/:job_id/cancel`, (req, res) => {
  res.json({message: 'Cancelled job in SS'});
});

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})


var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
