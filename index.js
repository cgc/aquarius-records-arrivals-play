var VISITED_GOLD = 'rgb(204, 153, 102)';

function get(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      cb(xhr.responseText);
    }
  }
  xhr.send();
}


function Song(anchor) {
  this.anchor = anchor;
}

Song.prototype = {
  fetchUrl: function(cb) {
    if (this.resolvedUrl) {
      return cb(this.resolvedUrl);
    }
    get(this.anchor.href, function(url) {
      this.resolvedUrl = url;
      cb(url);
    }.bind(this));
  },

  recordContainer: function() {
    return this.anchor.parentElement.parentElement;
  },

  artistName: function() {
    return this.recordContainer().querySelectorAll('b')[0].textContent;
  },

  recordName: function() {
    return this.recordContainer().querySelectorAll('b')[1].textContent;
  },

  name: function() {
    var name = this.anchor.textContent;
    if (name[0] === '"') {
      name = name.slice(1);
    }
    if (name[name.length - 1] === '"') {
      name = name.slice(0, name.length - 1);
    }
    return name;
  },
};


function renderPlayButton(playButton, state) {
  playButton.textContent = state.playing ? '(playing)' : '(play)';
  playButton.style.color = state.playing ? VISITED_GOLD : null;
}

function renderPlayerStatus(song) {
  playerStatus.textContent =  song ? [
    song.artistName(),
    song.recordName(),
    song.name(),
  ].join(' - ') : '';
  playerStatus.style.display = song ? 'block' : 'none';
}

function clearCurrentTrackStatus() {
  renderPlayButton(player.currentSong.play, { playing: false });
}

function clearPlayer() {
  clearCurrentTrackStatus();
  renderPlayerStatus();
  player.list = null;
  player.currentSong = null;
}

function _playSong() {
  if (!player.paused) {
    throw new Error('Player must be paused to play a song.')
  }
  var song = player.list[player.listIndex]
  player.currentSong = song;
  renderPlayButton(song.play, { playing: true });
  renderPlayerStatus(song);

  song.fetchUrl(function(url) {
    player.setAttribute('src', url);
    player.play();
  });
}

function handleTrackEnd() {
  if (player.listIndex === player.list.length - 1) {
    clearPlayer();
    player.listDone();
    return;
  }
  clearCurrentTrackStatus();
  player.listIndex++;
  _playSong()
}

function skipCurrentSong() {
  player.pause();
  handleTrackEnd();
}

function playList(list, done) {
  if (player.list) {
    player.pause();
    clearPlayer();
  }
  player.list = list;
  player.listIndex = 0;
  player.listDone = done;
  _playSong();
}


var player = document.createElement('audio');
player.setAttribute('controls', true);
player.addEventListener('ended', function() {
  handleTrackEnd();
});

var skipLink = document.createElement('a');
skipLink.setAttribute('href', '#');
skipLink.textContent = 'skip';
skipLink.addEventListener('click', function(event) {
  event.preventDefault();
  skipCurrentSong();
});
var playerStatus = document.createElement('div');
var playerStatusContainer = document.createElement('div');
Object.assign(playerStatusContainer.style, {
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  color: 'white',
  margin: '0 20px',
  borderTopLeftRadius: '4px',
  padding: '6px',
  borderTopRightRadius: '4px',
});
playerStatusContainer.appendChild(playerStatus);
playerStatusContainer.appendChild(document.createTextNode(' '));
playerStatusContainer.appendChild(skipLink);
renderPlayerStatus();

var playerContainer = document.createElement('div');
Object.assign(playerContainer.style, {
  position: 'fixed',
  left: 0,
  bottom: 0,
});
playerContainer.appendChild(playerStatusContainer);
playerContainer.appendChild(player);

Array.prototype.filter.call(
  document.querySelector('body').childNodes,
  function(node) {
    return node.tagName === 'FONT';
  }
)[0].appendChild(playerContainer);


function playButtonForList(playlist) {
  var play = document.createElement('a');
  play.setAttribute('href', '#');
  renderPlayButton(play, { playing: false });

  play.addEventListener('click', function(event) {
    event.preventDefault();

    renderPlayButton(play, { playing: true });
    playList(playlist, function() {
      renderPlayButton(play, { playing: false });
    });
  });
  return play;
}

function insertAfter(node, nodeToInsert) {
  // this function inserts nodeToInsert after node in the dom. so
  // node.nextSibling will be nodeToInsert
  node.parentElement.insertBefore(nodeToInsert, node.nextSibling);
}

// use this to deduplicate songs
var songsByHref = {};
var uniqueSongs = [];

Array.prototype.forEach.call(document.querySelectorAll('p'), function(recordContainer) {
  var songs = Array.prototype.slice.call(recordContainer.querySelectorAll('a'))
    .filter(function(anchor) { return /\.m3u$/.test(anchor.href); })
    .map(function(anchor) { return new Song(anchor); });
  if (!songs.length) {
    return;
  }
  var addToCart = recordContainer.querySelector('[alt="add to cart"]');
  insertAfter(addToCart, document.createTextNode(' '));
  insertAfter(addToCart, playButtonForList(songs));

  songs.forEach(function(song) {
    if (!songsByHref[song.anchor.href]) {
      songsByHref[song.anchor.href] = true;
      uniqueSongs.push(song);
    }

    var play = playButtonForList([song]);
    song.play = play;

    var playContainer = document.createElement('span')
    playContainer.appendChild(document.createTextNode(' '));
    playContainer.appendChild(play);
    insertAfter(song.anchor, playContainer);
  });
});

insertAfter(playerStatus, playButtonForList(uniqueSongs));
