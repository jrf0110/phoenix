var muxrpc     = require('muxrpc')
var ws         = require('pull-ws-server')
var Serializer = require('pull-serializer')
var util       = require('./util')

var reconnectTimeout
var wsStream
var rpcapi = muxrpc({ auth: 'async', ssb: require('../mans/ssb') }, null, serialize)()
connect()

function connect() {
  reconnectTimeout = null

  if (wsStream)
    rpcapi._emit('socket:reconnecting')

  wsStream = ws.connect({ host: 'localhost', port: 2000 })
  pull(wsStream, rpcapi.createStream(), wsStream)

  wsStream.socket.on('connect', function() {
    util.getJson('/access.json', function(err, token) {
      rpcapi.auth(token, function(err) {
        if (err) {
          rpcapi._emit('socket:error', new Error('AuthFail'))
          console.error('Failed to authenticate with backend', err)
        } else {
          rpcapi._emit('socket:connect')
        }
      })
    })
  })

  wsStream.socket.on('close', function() {
    rpcapi._emit('socket:error', new Error('Close'))
    console.error('Backend connection lost')
    if (!reconnectTimeout)
      reconnectTimeout = setTimeout(connect, 10*1000)
  })
}

function serialize (stream) {
  return Serializer(stream, JSON, {split: '\n\n'})
}

module.exports = rpcapi