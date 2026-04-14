export function installInput({
  canvas,
  documentRef,
  state,
  inputState,
  muteButton,
  beginGame,
  toggleMute,
  setQueuedDirection,
  pointInRect,
  onBossDebug
}) {
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (pointInRect(x, y, muteButton)) {
      toggleMute();
      return;
    }

    beginGame();
    inputState.touchStart = { x, y };
    inputState.swipeHandled = false;
  }, { passive: false });

  // rest of your pointer + key listeners...
}