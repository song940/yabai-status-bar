import * as Uebersicht from "uebersicht";
import * as DataWidget from "../widget.jsx";
import * as DataWidgetLoader from "../widget-loader.jsx";
import * as Icons from "../components/icons.jsx";
import useWidgetRefresh from "../hooks/use-widget-refresh";
import * as Settings from "../settings";
import * as Utils from "../utils";

const settings = Settings.get();
const { widgets, soundWidgetOptions } = settings;
const { soundWidget } = widgets;
const { refreshFrequency } = soundWidgetOptions;

const DEFAULT_REFRESH_FREQUENCY = 20000;
const REFRESH_FREQUENCY = Settings.getRefreshFrequency(
  refreshFrequency,
  DEFAULT_REFRESH_FREQUENCY
);

const getIcon = (volume, muted) => {
  if (muted === "true" || !volume) return Icons.VolumeMuted;
  if (volume < 20) return Icons.NoVolume;
  if (volume < 50) return Icons.VolumeLow;
  return Icons.VolumeHigh;
};

const setSound = (volume) => {
  if (volume === undefined) return;
  Uebersicht.run(`osascript -e 'set volume output volume ${volume}'`);
};

export const Widget = () => {
  const [state, setState] = Uebersicht.React.useState();
  const [loading, setLoading] = Uebersicht.React.useState(soundWidget);
  const { volume: _volume } = state || {};
  const [volume, setVolume] = Uebersicht.React.useState(
    _volume && parseInt(_volume)
  );
  const [dragging, setDragging] = Uebersicht.React.useState(false);

  const getSound = async () => {
    const [volume, muted] = await Promise.all([
      Uebersicht.run(
        `osascript -e 'set ovol to output volume of (get volume settings)'`
      ),
      Uebersicht.run(
        `osascript -e 'set ovol to output muted of (get volume settings)'`
      ),
    ]);
    setState({
      volume: Utils.cleanupOutput(volume),
      muted: Utils.cleanupOutput(muted),
    });
    setLoading(false);
  };

  useWidgetRefresh(soundWidget, getSound, REFRESH_FREQUENCY);

  Uebersicht.React.useEffect(() => {
    if (!dragging) setSound(volume);
  }, [dragging]);

  Uebersicht.React.useEffect(() => {
    if (_volume && parseInt(_volume) !== volume) {
      setVolume(parseInt(_volume));
    }
  }, [_volume]);

  if (loading) return <DataWidgetLoader.Widget className="sound" />;
  if (!state || volume === undefined) return null;

  const { muted } = state;
  if (_volume === "missing value" || muted === "missing value") return null;

  const Icon = getIcon(volume, muted);

  const onChange = (e) => {
    const value = parseInt(e.target.value);
    setVolume(value);
  };
  const onMouseDown = () => setDragging(true);
  const onMouseUp = () => setDragging(false);

  const fillerWidth = !volume ? volume : volume / 100 + 0.05;

  const classes = Utils.classnames("sound", { "sound--dragging": dragging });

  return (
    <DataWidget.Widget classes={classes} disableSlider>
      <Icon />
      <div className="sound__slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          className="sound__slider"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onChange={onChange}
        />
        <div
          className="sound__slider-filler"
          style={{ transform: `scaleX(${fillerWidth})` }}
        />
      </div>
      <span className="sound__value">{volume}%</span>
    </DataWidget.Widget>
  );
};

export const styles = /* css */ `
.sound {
  background-color: var(--blue);
  transform: translateZ(0);
}

.sound > svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-right: 0px;
  fill: currentColor;
}

.sound__value {
  margin-left: 4px;
}

.simple-bar--widgets-background-color-as-foreground .sound {
  color: var(--blue);
  background-color: transparent;
}
.sound__slider-container {
  position: relative;
  max-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0;
  overflow: hidden;
  opacity: 0.7;
  transition: max-width 320ms var(--transition-easing), padding 320ms var(--transition-easing),
    opacity 320ms var(--transition-easing);
}
.sound:hover .sound__slider-container,
.sound--dragging .sound__slider-container {
  max-width: 100px;
  padding: 0 2px;
}
.sound__slider-container:hover {
  opacity: 1;
}
.sound__slider {
  width: 100px;
  height: 2px;
  cursor: pointer;
  appearance: none;
  background-color: var(--background);
  outline: none;
  -webkit-appearance: none;
}
.simple-bar--widgets-background-color-as-foreground .sound__slider {
  background-color: var(--foreground);
}
.sound__slider::-webkit-slider-thumb {
  width: 8px;
  height: 8px;
  background-color: var(--foreground);
  border-radius: 50%;
  cursor: pointer;
  -webkit-appearance: none;
  transition: width 160ms var(--transition-easing), height 160ms var(--transition-easing)
}
.simple-bar--widgets-background-color-as-foreground .sound__slider::-webkit-slider-thumb {
  background-color: var(--blue);
}
.sound__slider::-webkit-slider-thumb:hover {
  width: 10px;
  height: 10px;
}
.sound__slider-filler {
  position: absolute;
  top: calc(50% - 1px);
  left: 4px;
  width: calc(100% - 8px);
  height: 2px;
  background-color: var(--foreground);
  transform-origin: left;
}
.simple-bar--widgets-background-color-as-foreground .sound__slider-filler {
  background-color: var(--blue);
}
`;
