class CodeRadio {
  constructor(initState, initVolume, initTrack) {
    this.play = initState;
    this.volume = initVolume;
    this.track = initTrack;
    this.listeners = 0;
  }

  playHandler() {}
  volumeHandler(value) {
    this.volume = value;
  }

  trackHandler(track) {
    this.track = track;
  }
  getListeners() {
    return this.listeners;
  }
  getSongMetaData() {
    const songMeta = {
      title,
      artist,
      album,
      listeners,
    };
    return songMeta;
  }
}
