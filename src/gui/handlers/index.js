module.exports = {
  'click-navigate': function(state, el) { window.location = el.href },
  'submit-publish-text-post': require('./textpost').submit,
  'click-preview-text-post': require('./textpost').preview,
  'click-reply': require('./textpost').reply,
  'click-cancel-reply': require('./textpost').cancelReply,
  'click-react': function(state, el, e) {
    var text = prompt('What is your reaction? eg "likes", "agrees with"')
    if (!text)
      return

    state.apis.feed.postReaction(text, el.dataset.msgid, function(err) {
      if (err) swal('Error While Publishing', err.message, 'error')
      else state.sync()
    })
  },
  'click-follow': require('./profiles').follow,
  'click-unfollow': require('./profiles').unfollow,
  'click-set-name': require('./profiles').setName,
  'click-add-contact': require('./profiles').followPrompt
}