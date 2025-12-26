function entrarTelaCheia() {
  let isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  if (!isFullscreen) {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}
document
  .getElementById("btn_fullscreen")
  .addEventListener("click", entrarTelaCheia);
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "F") {
    entrarTelaCheia();
  }
});
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    let viewHeight = window.visualViewport.height;
    document.body.style.height = viewHeight + "px";
    scrollToBottom();
  });
}
