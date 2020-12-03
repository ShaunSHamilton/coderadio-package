# CodeRadio Refactor

A _bare-bones_ module for injecting CodeRadio into the various freeCodeCamp platforms.

Thoughts:

- [x] A module which contains no UI, and is attached to existing UI?
- [ ] A module which contains a component UI accepting styling?
- [ ] A module class with `playHandler`, `volumeHandler`, and `trackHandler` methods?

---

## Example Usage

```javascript
import CodeRadio from "@freecodecamp/coderadio"; // Not real, yet

const audio = document.querySelector("audio");
const radio = new CodeRadio(audio);

document.querySelector("button").addEventListener("click", () => {
  radio.togglePlay();
});
```

---

## Design

### Methods

```typescript
decreaseVolume = (): void;

fade = (direction: string = "down"): void;

fadeDown = (): void;

fadeUp = (): void;

getNowPlaying = (): void;

getStreamUrl = (streams: , lowBitrate: boolean = false): ;

onPlayerError = ():

pause = (): void;

play = (): void;

setMountToConnection = (mounts: [] = [], remotes: [] = []): void;

setTargetVolume = (volume: number): void; // volume <= 1

sortStreams = (streams: [streams], lowBitrate: boolean = false): [sortedStreams];

togglePlay = (): void;

```

### Properties

```typescript
this._player: HTMLAudioref = null;
this.state = {
  /** *
   * General configuration options
   */
  config: {
    metadataTimer<number>: 1000,
  },
  fastConnection<boolean | null>: navigator.connection
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
    targetVolume<number>: 0,
    maxVolume<number>: 0.5,
    volumeSteps<number>: 0.1,
    currentVolume<number>: 0.5,
    volumeTransitionSpeed<number>: 100,
  },

  /** *
   * This is where all the audio is pumped through. Due
   * to it being a single audio element, there should be
   * no memory leaks of extra floating audio elements.
   */
  url<string>: "",
  mounts: [],
  remotes: [],
  playing<boolean | null>: null,
  pullMeta<boolean>: false,
  erroredStreams: [],

  // Note: the crossOrigin is needed to fix a CORS JavaScript requirement

  /** *
   * There are a few *private* variables used
   */
  currentSong: {},
  songStartedAt<number>: 0,
  songDuration<number>: 0,
  listeners<number>: 0,
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
```
