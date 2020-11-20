class CodeRadio {
  constructor(initState, initVolume, initTrack) {
    this.play = initState;
    this.volume = initVolume;
    this.track = initTrack;
    this.listeners = 0;

    this.state = {
      /** *
       * General configuration options
       */
      config: {
        metadataTimer: 1000,
      },
      fastConnection: navigator.connection
        ? navigator.connection.downlink > 1.5
        : null,

      /** *
       * The equalizer data is held as a separate data set
       * to allow for easy implementation of visualizers.
       * With the ultimate goal of this allowing plug and
       * play visualizers.
       */
      eq: {},

      /** *
       * Potentially removing the visualizer from this class
       * to build it as a stand alone element that can be
       * replaced by community submissions
       */
      visualizer: {},

      // Some basic configuration for nicer audio transitions
      // (Used in earlier projects and just maintained)
      audioConfig: {
        targetVolume: 0,
        maxVolume: 0.5,
        volumeSteps: 0.1,
        currentVolume: 0.5,
        volumeTransitionSpeed: 100,
      },

      /** *
       * This is where all the audio is pumped through. Due
       * to it being a single audio element, there should be
       * no memory leaks of extra floating audio elements.
       */
      url: "",
      mounts: [],
      remotes: [],
      playing: null,
      pullMeta: false,
      erroredStreams: [],

      // Note: the crossOrigin is needed to fix a CORS JavaScript requirement

      /** *
       * There are a few *private* variables used
       */
      currentSong: {},
      songStartedAt: 0,
      songDuration: 0,
      listeners: 0,
    };

    // Keyboard shortcuts
    this.keyMap = {
      TOGGLE_PLAY: ["space", "k"],
      INCREASE_VOLUME: "up",
      DECREASE_VOLUME: "down",
    };

    // Keyboard shortcut handlers
    this.handlers = {
      TOGGLE_PLAY: () => this.playHandler(),
      INCREASE_VOLUME: () => this.increaseVolume(this.volume + 1),
      DECREASE_VOLUME: () => this.decreaseVolume(this.volume - 1),
    };
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
