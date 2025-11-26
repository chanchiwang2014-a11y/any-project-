// Grab DOM references for video and UI controls
const video = document.getElementById('video');
const playPauseBtn = document.getElementById('play-pause');
const rewindBtn = document.getElementById('rewind');
const forwardBtn = document.getElementById('forward');
const fullscreenBtn = document.getElementById('fullscreen');
const remainingEl = document.getElementById('remaining');
const seekInput = document.getElementById('seek');
const progressFill = document.getElementById('progress');
const bufferedFill = document.getElementById('buffered');
const thumb = document.getElementById('thumb');
const preview = document.getElementById('preview');
const previewTime = document.getElementById('preview-time');

// Prevent context menu and drag actions that may trigger external download helpers
video.addEventListener('contextmenu', (event) => event.preventDefault());
video.addEventListener('dragstart', (event) => event.preventDefault());

// Helper: format seconds to mm:ss or hh:mm:ss when long videos are loaded
function formatTime(seconds) {
  const rounded = Math.max(seconds, 0);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = Math.floor(rounded % 60);
  const parts = [m, s].map((v) => String(v).padStart(2, '0'));
  if (h > 0) parts.unshift(String(h).padStart(2, '0'));
  return parts.join(':');
}

// Update remaining time and progress visuals
function updateUI() {
  if (!Number.isFinite(video.duration)) return;
  const remaining = video.duration - video.currentTime;
  remainingEl.textContent = `-${formatTime(remaining)}`;

  // Progress fill width and thumb position
  const percent = (video.currentTime / video.duration) * 100;
  progressFill.style.width = `${percent}%`;
  thumb.style.left = `${percent}%`;
  seekInput.value = video.currentTime;

  // Update buffered bar from the last buffered range
  if (video.buffered.length) {
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / video.duration) * 100;
    bufferedFill.style.width = `${bufferedPercent}%`;
  }
}

// Toggle play/pause and swap the displayed icon
function togglePlayPause() {
  if (video.paused) {
    video.play();
    playPauseBtn.querySelector('[data-icon="play"]').textContent = '⏸';
  } else {
    video.pause();
    playPauseBtn.querySelector('[data-icon="play"]').textContent = '▶';
  }
}

// Seek relative to current time with clamping
function seekBy(offset) {
  const next = Math.min(Math.max(video.currentTime + offset, 0), video.duration || 0);
  video.currentTime = next;
}

// When metadata is ready, sync slider max and UI
video.addEventListener('loadedmetadata', () => {
  seekInput.max = video.duration;
  updateUI();
});

// Keep UI in sync during playback
video.addEventListener('timeupdate', updateUI);
video.addEventListener('progress', updateUI);

// Playback controls
playPauseBtn.addEventListener('click', togglePlayPause);
rewindBtn.addEventListener('click', () => seekBy(-10));
forwardBtn.addEventListener('click', () => seekBy(10));

// Dragging/keyboard scrubbing via the hidden range input
seekInput.addEventListener('input', (event) => {
  video.currentTime = Number(event.target.value);
});

// Compute preview location and timestamp on hover
const timeline = document.querySelector('.timeline');
timeline.addEventListener('mousemove', (event) => {
  if (!Number.isFinite(video.duration)) return;
  const rect = timeline.getBoundingClientRect();
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const previewTimeValue = ratio * video.duration;
  previewTime.textContent = formatTime(previewTimeValue);

  // Position the preview bubble and clamp within the timeline bounds
  const previewX = ratio * rect.width;
  const clamp = Math.min(Math.max(previewX, 30), rect.width - 30);
  preview.style.left = `${clamp}px`;
});

// Hide preview when pointer leaves the timeline area
['mouseleave', 'blur'].forEach((evt) => {
  timeline.addEventListener(evt, () => {
    preview.style.opacity = 0;
  });
});

// Reveal preview when the timeline is hovered
['mouseenter', 'focus'].forEach((evt) => {
  timeline.addEventListener(evt, () => {
    if (Number.isFinite(video.duration)) preview.style.opacity = 1;
  });
});

// Fullscreen toggle using the standardized API when available
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// Keyboard shortcuts for convenience
window.addEventListener('keydown', (event) => {
  if (['Space', 'KeyK'].includes(event.code)) {
    event.preventDefault();
    togglePlayPause();
  }
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    seekBy(-10);
  }
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    seekBy(10);
  }
  if (event.code === 'KeyF') {
    fullscreenBtn.click();
  }
});
