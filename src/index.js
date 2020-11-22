// import * as NchanSubscriber from "../node_modules/nchan/NchanSubscriber.js";

// console.log(NchanSubscriber);
const SUB = new NchanSubscriber(
  "wss://coderadio-admin.freecodecamp.org/api/live/nowplaying/coderadio"
);

function CodeRadio(audio) {
  this._player = audio;
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
    INCREASE_VOLUME: () => this.increaseVolume(),
    DECREASE_VOLUME: () => this.decreaseVolume(),
  };
  this.setPlayerInitial();
  this.getNowPlaying();
}

CodeRadio.prototype.playHandler = function () {};
CodeRadio.prototype.increaseVolume = function () {
  this.setTargetVolume(
    Math.min(
      this.state.audioConfig.maxVolume + this.state.audioConfig.volumeSteps,
      1
    )
  );
};

CodeRadio.prototype.decreaseVolume = function () {
  this.setTargetVolume(
    Math.max(
      this.state.audioConfig.maxVolume - this.state.audioConfig.volumeSteps,
      0
    )
  );
};

CodeRadio.prototype.setPlayerInitial = function () {
  this._player.volume = this.state.audioConfig.maxVolume;
};

/** *
 * If we ever change the URL, we need to update the player
 * and begin playing it again. This can happen if the server
 * resets the URL.
 */
CodeRadio.prototype.setUrl = function (url = false) {
  if (!url) return;

  if (this.state.playing) this.pause();

  this._player.src = url;
  this.url = url;

  // Since the `playing` state is initially `null` when the app first loads
  // and is set to boolean when there is an user interaction,
  // we prevent the app from auto-playing the music
  // by only calling `this.play()` if the `playing` state is not `null`
  if (this.state.playing !== null) {
    this.play();
  }
};

CodeRadio.prototype.play = function () {
  const { mounts, remotes } = this.state;
  if (this._player.paused) {
    if (!SUB.running) {
      SUB.start();
    }

    let streamUrls = Array.from(
      [...mounts, ...remotes],
      (stream) => stream.url
    );

    // check if the url has been reset by pause
    if (!streamUrls.includes(this._player.src)) {
      console.log("loading...", streamUrls, this._player);
      this._player.src = this.state.url;
      this._player.load();
    }
    this._player.volume = 0;
    this._player.play();

    let audioConfig = this.state.audioConfig;
    audioConfig.currentVolume = 0;
    this.audioConfig = audioConfig;
    this.playing = true;
    this.pullMeta = true;

    this.fadeUp();
  }
};

CodeRadio.prototype.pause = function () {
  // completely stop the audio element
  this._player.src = "";
  this._player.pause();
  this._player.load();

  this.playing = false;
  SUB.stop();
};

/** *
 * Very basic method that acts like the play/pause button
 * of a standard player. It loads in a new song if there
 * isn’t already one loaded.
 */
CodeRadio.prototype.togglePlay = function () {
  // If there already is a source, confirm it’s playing or not
  if (this._player.src) {
    // If the player is paused, set the volume to 0 and fade up
    if (this._player.paused) {
      this.play();
    }
    // if it is already playing, fade the music out (resulting in a pause)
    else {
      this.fade();
    }
  }
};

CodeRadio.prototype.setTargetVolume = function (v) {
  let audioConfig = { ...this.state.audioConfig };
  let maxVolume = parseFloat(Math.max(0, Math.min(1, v).toFixed(1)));
  audioConfig.maxVolume = maxVolume;
  audioConfig.currentVolume = maxVolume;
  this._player.volume = audioConfig.maxVolume;
  this.audioConfig = audioConfig;
  console.log(v, maxVolume);
};

/**
 *
 * Simple fade command to initiate the playing and pausing
 *  in a more fluid method  */

CodeRadio.prototype.fade = function (direction = "down") {
  let audioConfig = { ...this.state.audioConfig };
  audioConfig.targetVolume =
    direction.toLowerCase() === "up" ? this.state.audioConfig.maxVolume : 0;
  this.audioConfig = audioConfig;
  this.updateVolume();
};

CodeRadio.prototype.fadeUp = function () {
  this.fade("up");
};

CodeRadio.prototype.fadeDown = function () {
  this.fade("down");
};

// In order to have nice fading,
// this method adjusts the volume dynamically over time.
CodeRadio.prototype.updateVolume = function () {
  /*
   *  In order to fix floating math issues,
   *  we set the toFixed in order to avoid 0.999999999999 increments
   */
  let currentVolume = parseFloat(this._player.volume.toFixed(1));
  // If the volume is correctly set to the target, no need to change it
  if (currentVolume === this.state.audioConfig.targetVolume) {
    // If the audio is set to 0 and it’s been met, pause the audio
    if (this.state.audioConfig.targetVolume === 0) this.pause();

    // Unmet audio volume settings require it to be changed
  } else {
    /*
     *  We capture the value of the next increment by either the configuration
     *  or the difference between the current and target
     *  if it's smaller than the increment
     *
     */

    let volumeNextIncrement = Math.min(
      this.state.audioConfig.volumeSteps,
      Math.abs(this.state.audioConfig.targetVolume - this._player.volume)
    );

    // Adjust the audio based on if the target is
    // higher or lower than the current
    let volumeAdjust =
      this.state.audioConfig.targetVolume > this._player.volume
        ? volumeNextIncrement
        : -volumeNextIncrement;

    this._player.volume += volumeAdjust;

    let audioConfig = this.state.audioConfig;
    audioConfig.currentVolume += volumeAdjust;

    this.audioConfig = audioConfig;
    // The speed at which the audio lowers is also controlled.
    setTimeout(
      () => this.updateVolume(),
      this.state.audioConfig.volumeTransitionSpeed
    );
  }
};

CodeRadio.prototype.sortStreams = function (streams, lowBitrate = false) {
  return streams.sort((a, b) => {
    if (lowBitrate) {
      // sort by bitrate from low to high
      if (parseFloat(a.bitrate) < parseFloat(b.bitrate)) return -1;
      if (parseFloat(a.bitrate) > parseFloat(b.bitrate)) return 1;
    } else {
      // sort by bitrate, from high to low
      if (parseFloat(a.bitrate) < parseFloat(b.bitrate)) return 1;
      if (parseFloat(a.bitrate) > parseFloat(b.bitrate)) return -1;
    }

    // if both items have the same bitrate, sort by listeners from low to high
    if (a.listeners.current < b.listeners.current) return -1;
    if (a.listeners.current > b.listeners.current) return 1;
    return 0;
  });
};

CodeRadio.prototype.getStreamUrl = function (streams, lowBitrate) {
  const sorted = this.sortStreams(streams, lowBitrate);
  return sorted[0].url;
};

// choose the stream based on the connection and availablity of relay(remotes)
CodeRadio.prototype.setMountToConnection = function (
  mounts = [],
  remotes = []
) {
  let url = null;
  if (this.state.fastConnection === false && remotes.length > 0) {
    url = this.getStreamUrl(remotes, true);
  } else if (this.state.fastConnection && remotes.length > 0) {
    url = this.getStreamUrl(remotes);
  } else if (this.state.fastConnection === false) {
    url = this.getStreamUrl(mounts, true);
  } else {
    url = this.getStreamUrl(mounts);
  }
  this._player.src = url;
  this.url = url;
};

CodeRadio.prototype.getNowPlaying = function () {
  SUB.on("message", (message) => {
    let np = JSON.parse(message);

    // We look through the available mounts to find the default mount
    if (this.state.url === "") {
      this.state.mounts = np.station.mounts;
      (this.state.remotes = np.station.remotes),
        this.setMountToConnection(np.station.mounts, np.station.remotes);
    }

    if (this.state.listeners !== np.listeners.current) {
      this.state.listeners = np.listeners.current;
    }

    // We only need to update the metadata if the song has been changed
    if (
      np.now_playing.song.id !== this.state.currentSong.id ||
      this.state.pullMeta
    ) {
      this.state.currentSong = np.now_playing.song;
      this.state.songStartedAt = np.now_playing.played_at * 1000;
      this.state.songDuration = np.now_playing.duration;
      this.state.pullMeta = false;
    }
  });
  SUB.reconnectTimeout = this.state.config.metadataTimer;
  SUB.start();
};

CodeRadio.prototype.onPlayerError = function () {
  /*
   * This error handler works as follows:
   * - When the player cannot play the url:
   *   - If the url is already in the `erroredStreams` list: try another url
   *   - If the url is not in `erroredStreams`: add the url to the list and
   *     try another url
   * - If `erroredStreams` has as many items as the list of available streams:
   *   - Pause the player because this means all of our urls are having issues
   */

  if (this.state.playing) {
    const { mounts, remotes, erroredStreams, url } = this.state;
    const sortedStreams = this.sortStreams([...mounts, ...remotes]);
    const currentStream = sortedStreams.find((stream) => stream.url === url);
    const isStreamInErroredList = erroredStreams.some(
      (stream) => stream.url === url
    );
    const newErroredStreams = isStreamInErroredList
      ? erroredStreams
      : [...erroredStreams, currentStream];

    // Pause if all streams are in the errored list
    if (newErroredStreams.length === sortedStreams.length) {
      this.pause();
      return;
    }

    // Available streams are those in `sortedStreams`
    // that don't exist in the errored list
    const availableUrls = sortedStreams
      .filter(
        (stream) =>
          !newErroredStreams.some(
            (erroredStream) => erroredStream.url === stream.url
          )
      )
      .map(({ url }) => url);

    // If the url is already in the errored list, use another url
    if (isStreamInErroredList) {
      this.setUrl(availableUrls[0]);
    } else {
      // Otherwise, add the url to the errored list, then use another url
      this.erroredStreams = newErroredStreams;
      this.setUrl(availableUrls[0]);
    }
  }
};

// module.export = CodeRadio;
// export default CodeRadio;
