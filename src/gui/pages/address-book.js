var h = require('hyperscript')
var pull = require('pull-stream')
var com = require('../com')

module.exports = function(state) {
  state.setPage(com.page(state, 'network', h('.row',
    h('.col-xs-2.col-md-1', com.sidenav(state)),
    h('.col-xs-8',
      h('table.table.addresses',
        h('thead', h('tr', h('th', 'Name'), h('th', {width: '100'}), h('th.text-center', {width:'70'}, 'Follow'))),
        h('tbody',
          Object.keys(state.profiles).map(function(id) { 
            var profile = state.profiles[id]
            var otherNames = getOtherNames(state.names[id], profile)
            function f (e) { follow(e, id) }
            function unf (e) { unfollow(e, id) }
            return h('tr',
              h('td', 
                h('button.btn.btn-primary.btn-sm', {title: 'Rename'}, com.icon('pencil')), ' ',
                h('strong', com.a('#/profile/'+id, state.names[id])),
                ' ', 
                (otherNames.length)
                  ? h('small.text-muted', 'aka ', otherNames.join(', '))
                  : ''
              ),
              h('td',
                (~state.user.followers.indexOf(id)) ? h('small.text-muted', 'follows you') : ''
              ),
              h('td.text-center', 
                (~state.user.following.indexOf(id))
                  ? h('button.btn.btn-primary.btn-sm', { title: 'Unfollow', onclick: unf }, h('span.label.label-success', com.icon('ok')), ' ', com.icon('minus'))
                  : h('button.btn.btn-primary.btn-sm', { title: 'Follow', onclick: f }, com.icon('plus'))
              )
            )
          })
        )
      )
    ),
    h('.col-xs-2.col-md-3',
      com.adverts(state),
      h('hr'),
      com.sidehelp(state)
    )
  )))

  // handlers

  function follow (e, pid) {
    e.preventDefault()
    var isFollowing = (state.user.following.indexOf(pid) != -1)
    if (!isFollowing) {
      state.apis.network.follow(pid, function(err) {
        if (err) swal('Error While Publishing', err.message, 'error')
        else state.sync()
      })
    }
  }

  function unfollow (e, pid) {
    e.preventDefault()
    var isFollowing = (state.user.following.indexOf(pid) != -1)
    if (isFollowing) {
      state.apis.network.unfollow(pid, function(err) {
        if (err) swal('Error While Publishing', err.message, 'error')
        else state.sync()
      })
    }
  }
}

function getOtherNames(name, profile) {
  // todo - replace with ranked names

  // remove scare quotes 
  if (name.charAt(0) === '"' && name.charAt(name.length - 1) === '"')
    name = name.slice(1, -1)

  var names = []
  function add(n) {
    if (n && n !== name && !~names.indexOf(n))
      names.push(n)
  }

  // get 3 of the given or self-assigned names
  add(profile.self.name)
  for (var k in profile.given) {
    if (names.length >= 3)
      break
    add(profile.given[k].name)
  }
  return names
}