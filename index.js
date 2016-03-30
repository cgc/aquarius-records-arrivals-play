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

var player = document.createElement('audio');
player.setAttribute('controls', true);
Object.assign(player.style, {
  position: 'fixed',
  left: 0,
  bottom: 0,
});

function handleEnd() {
  if (!player.currentAnchor) {
    return;
  }
  player.currentAnchor.play.textContent = '(play)';
  player.currentAnchor.play.style.color = null;
  player.currentAnchor = null;
}

player.addEventListener('ended', function() {
  handleEnd();
});

document.querySelector('body').appendChild(player);

var anchors = Array.prototype.slice.call(document.querySelectorAll('a'))
  .filter(function(anchor) { return /\.m3u$/.test(anchor.href); });

anchors.forEach(function(anchor) {
  var playContainer = document.createElement('span')
  playContainer.textContent = ' ';
  var play = document.createElement('a');
  play.setAttribute('href', '#');
  play.textContent = '(play)';
  playContainer.appendChild(play);

  // reference used for re-rendering above
  anchor.play = play;

  play.addEventListener('click', function(event) {
    event.preventDefault();

    if (player.currentAnchor === anchor) {
      return;
    }

    player.pause();
    handleEnd();
    player.currentAnchor = anchor;
    play.textContent = '(playing)';
    play.style.color = VISITED_GOLD;

    get(anchor.href, function(url) {
      player.setAttribute('src', url);
      player.play();
    });
  });

  anchor.parentElement.insertBefore(playContainer, anchor.nextSibling);
});
