const video = document.getElementById('video');
const playlistEl = document.getElementById('playlist');
const playPauseBtn = document.getElementById('play-pause');
const skipBackBtn = document.getElementById('skip-back');
const skipForwardBtn = document.getElementById('skip-forward');
const muteBtn = document.getElementById('mute');
const volumeSlider = document.getElementById('volume');
const fullscreenBtn = document.getElementById('fullscreen');
const progress = document.getElementById('progress');
const timeLabel = document.getElementById('time');

const playlist = [
  {
    title: 'Coastline Drone Flyover',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    title: 'Bear at the Waterfall',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
  },
  {
    title: 'Big Buck Bunny (clip)',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
];

let currentIndex = 0;
let isSeeking = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  playlist.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item.title;
    li.dataset.index = index;
    if (index === currentIndex) li.classList.add('active');
    li.addEventListener('click', () => switchVideo(index));
    playlistEl.appendChild(li);
  });
}

function setActiveItem(index) {
  Array.from(playlistEl.children).forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });
}

function switchVideo(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  video.src = playlist[index].src;
  video.play().catch(() => video.pause());
  setActiveItem(index);
}

function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function updatePlayPauseIcon() {
  playPauseBtn.textContent = video.paused ? '▶️' : '⏸️';
}

function updateProgress() {
  if (!isSeeking) {
    const percent = (video.currentTime / video.duration) * 100 || 0;
    progress.value = percent;
  }
  timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
}

function seek(event) {
  const percent = Number(event.target.value);
  const time = (percent / 100) * video.duration;
  video.currentTime = time;
}

function toggleMute() {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? '🔇' : '🔈';
}

function enterFullscreen() {
  const container = document.querySelector('.player__viewport');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (container.requestFullscreen) {
    container.requestFullscreen();
  }
}

function init() {
  renderPlaylist();
  volumeSlider.value = 0.7;
  video.volume = 0.7;
  switchVideo(currentIndex);

  playPauseBtn.addEventListener('click', togglePlay);
  video.addEventListener('play', updatePlayPauseIcon);
  video.addEventListener('pause', updatePlayPauseIcon);
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', updateProgress);
  video.addEventListener('ended', () => {
    const next = (currentIndex + 1) % playlist.length;
    switchVideo(next);
  });

  skipBackBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  });

  skipForwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  });

  volumeSlider.addEventListener('input', (e) => {
    video.volume = Number(e.target.value);
    video.muted = video.volume === 0;
    muteBtn.textContent = video.muted ? '🔇' : '🔈';
  });

  muteBtn.addEventListener('click', toggleMute);
  fullscreenBtn.addEventListener('click', enterFullscreen);

  progress.addEventListener('input', (e) => {
    isSeeking = true;
    seek(e);
  });
  progress.addEventListener('change', (e) => {
    isSeeking = false;
    seek(e);
  });
}

document.addEventListener('DOMContentLoaded', init);
