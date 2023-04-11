import * as Uebersicht from "uebersicht";
import * as DataWidget from "../widget.jsx";
import * as DataWidgetLoader from "../widget-loader.jsx";
import * as Icons from "../components/icons.jsx";
import * as Settings from "../settings.js";
import * as Utils from "../utils.js";
import useWidgetRefresh from "../hooks/use-widget-refresh.js";

const settings = Settings.get();
const { widgets, micWidgetOptions } = settings;
const { micWidget } = widgets;
const { refreshFrequency } = micWidgetOptions;

const DEFAULT_REFRESH_FREQUENCY = 20000;
const REFRESH_FREQUENCY = Settings.getRefreshFrequency(
  refreshFrequency,
  DEFAULT_REFRESH_FREQUENCY
);

const setMic = (volume) => {
  if (volume === undefined) return;
  Uebersicht.run(`osascript -e 'set volume input volume ${volume}'`);
};

export const Widget = () => {
  const [state, setState] = Uebersicht.React.useState();
  const [loading, setLoading] = Uebersicht.React.useState(micWidget);
  const { volume: _volume } = state || {};
  const [volume, setVolume] = Uebersicht.React.useState(
    _volume && parseInt(_volume)
  );
  const [dragging, setDragging] = Uebersicht.React.useState(false);

  const getMic = async () => {
    const volume = await Uebersicht.run(
      `osascript -e 'set ovol to input volume of (get volume settings)'`
    );
    setState({ volume: Utils.cleanupOutput(volume) });
    setLoading(false);
  };

  useWidgetRefresh(micWidget, getMic, REFRESH_FREQUENCY);

  Uebersicht.React.useEffect(() => {
    if (!dragging) setMic(volume);
  }, [dragging]);

  Uebersicht.React.useEffect(() => {
    if (_volume && parseInt(_volume) !== volume) {
      setVolume(parseInt(_volume));
    }
  }, [_volume]);

  if (loading) return <DataWidgetLoader.Widget className="mic" />;
  if (!state || volume === undefined || _volume === "missing value")
    return null;

  const Icon = !volume ? Icons.MicOff : Icons.MicOn;

  const onChange = (e) => {
    const value = parseInt(e.target.value);
    setVolume(value);
  };
  const onMouseDown = () => setDragging(true);
  const onMouseUp = () => setDragging(false);

  const fillerWidth = !volume ? volume : volume / 100 + 0.05;

  const classes = Utils.classnames("mic", { "mic--dragging": dragging });
  return (
    <DataWidget.Widget classes={classes} disableSlider>
      <Icon />
      <div className="mic__slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          className="mic__slider"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onChange={onChange}
        />
        <div
          className="mic__slider-filler"
          style={{ transform: `scaleX(${fillerWidth})` }}
        />
      </div>
      <span className="mic__value">{volume}%</span>
    </DataWidget.Widget>
  );
};

export const styles = /* css */ `
.mic {
  background-color: var(--orange);
  transform: translateZ(0);
}
.mic > svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-right: 0px;
  fill: currentColor;
}

.mic__value {
  margin-left: 4px;
}

.simple-bar--widgets-background-color-as-foreground .mic {
  color: var(--orange);
  background-color: transparent;
}
.mic__slider-container {
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
.mic:hover .mic__slider-container,
.mic--dragging .mic__slider-container {
  max-width: 100px;
  padding: 0 2px;
}
.mic__slider-container:hover {
  opacity: 1;
}
.mic__slider {
  width: 100px;
  height: 2px;
  appearance: none;
  background-color: var(--background);
  outline: none;
  -webkit-appearance: none;
}
.simple-bar--widgets-background-color-as-foreground .mic__slider {
  background-color: var(--foreground);
}
.mic__slider::-webkit-slider-thumb {
  width: 8px;
  height: 8px;
  background-color: var(--foreground);
  border-radius: 50%;
  cursor: pointer;
  -webkit-appearance: none;
  transition: width 160ms var(--transition-easing), height 160ms var(--transition-easing)
}
.simple-bar--widgets-background-color-as-foreground .mic__slider::-webkit-slider-thumb {
  background-color: var(--orange);
}
.mic__slider::-webkit-slider-thumb:hover {
  width: 10px;
  height: 10px;
}
.mic__slider-filler {
  position: absolute;
  top: calc(50% - 1px);
  left: 4px;
  width: calc(100% - 8px);
  height: 2px;
  background-color: var(--foreground);
  transform-origin: left;
}
.simple-bar--widgets-background-color-as-foreground .mic__slider-filler {
  background-color: var(--orange);
}
.mic__display {
  display: flex;
  align-items: center;
  margin-right: 4px;
  overflow: hidden;
}
.mic__display:active {
  color: currentColor;
}
`;
