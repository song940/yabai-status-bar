import UserWidgets from "./lib/components/data/user-widgets.jsx";
import * as Error from "./lib/components/error.jsx";
import * as Spaces from "./lib/components/spaces/spaces.jsx";
import * as Process from "./lib/components/spaces/process.jsx";
import * as Variables from "./lib/styles/core/variables";
import * as Base from "./lib/styles/core/base";
import * as Zoom from "./lib/components/data/zoom.jsx";
import * as Weather from "./lib/components/data/weather.jsx";

import * as Time from "./lib/widgets/time.jsx";
import * as Mic from "./lib/widgets/mic.jsx";
import * as Wifi from "./lib/widgets/wifi.jsx";
import * as Sound from "./lib/widgets/sound.jsx";
import * as Battery from "./lib/widgets/battery.jsx";
import * as Calendar from "./lib/widgets/calendar.jsx";

import * as Keyboard from "./lib/components/data/keyboard.jsx";
import * as Spotify from "./lib/components/data/spotify.jsx";
import * as Crypto from "./lib/components/data/crypto.jsx";
import * as Stock from "./lib/components/data/stock.jsx";
import * as Music from "./lib/components/data/music.jsx";
import * as Mpd from "./lib/components/data/mpd.jsx";
import * as BrowserTrack from "./lib/components/data/browser-track.jsx";
import * as Dnd from "./lib/components/data/dnd.jsx";
import * as Specter from "./lib/components/data/specter.jsx";
import * as WidgetLoader from "./lib/widget-loader.jsx";
import * as Widget from "./lib/widget.jsx";
import * as Utils from "./lib/utils";
import * as Settings from "./lib/settings";

const refreshFrequency = false;

const settings = Settings.get();
const { yabaiPath = "/usr/local/bin/yabai", shell } = settings.global;
const { processWidget } = settings.widgets;

const command = `${shell} simple-bar/lib/scripts/init.sh ${yabaiPath}`;

Utils.injectStyles("simple-bar-index-styles", [
  Variables.styles,
  Base.styles,
  Spaces.styles,
  Process.styles,
  Settings.styles,
  settings.customStyles.styles,
  Widget.styles,
  Calendar.styles,
  Zoom.styles,
  Time.styles,
  Weather.styles,
  Crypto.styles,
  Stock.styles,
  Battery.styles,
  Wifi.styles,
  Keyboard.styles,
  Mic.styles,
  Sound.styles,
  Spotify.styles,
  Music.styles,
  Mpd.styles,
  BrowserTrack.styles,
  Dnd.styles,
  Specter.styles,
  WidgetLoader.styles,
]);

const render = ({ output, error }) => {
  const baseClasses = Utils.classnames("simple-bar", {
    "simple-bar--floating": settings.global.floatingBar,
    "simple-bar--no-bar-background": settings.global.noBarBg,
    "simple-bar--no-color-in-data": settings.global.noColorInData,
    "simple-bar--on-bottom": settings.global.bottomBar,
    "simple-bar--inline-spaces-options": settings.global.inlineSpacesOptions,
    "simple-bar--spaces-background-color-as-foreground":
      settings.global.spacesBackgroundColorAsForeground,
    "simple-bar--widgets-background-color-as-foreground":
      settings.global.widgetsBackgroundColorAsForeground,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error in spaces.jsx", error);
    return <Error.Component type="error" classes={baseClasses} />;
  }
  if (!output) return <Error.Component type="noOutput" classes={baseClasses} />;
  if (Utils.cleanupOutput(output) === "yabaiError") {
    return <Error.Component type="yabaiError" classes={baseClasses} />;
  }

  const data = Utils.parseJson(output);
  if (!data) return <Error.Component type="noData" classes={baseClasses} />;

  const { displays, shadow, SIP, spaces, windows } = data;

  const displayId = parseInt(window.location.pathname.replace("/", ""));
  const { index: displayIndex } = displays.find((d) => {
    return d.id === displayId;
  });

  const classes = Utils.classnames(baseClasses, {
    "simple-bar--no-shadow": shadow !== "on",
  });

  Utils.handleBarFocus();

  return (
    <div className={classes}>
      <Spaces.Component
        spaces={spaces}
        windows={windows}
        SIP={SIP}
        displayIndex={displayIndex}
      />
      {processWidget && (
        <Process.Component
          displayIndex={displayIndex}
          spaces={spaces}
          windows={windows}
        />
      )}
      <div className="simple-bar__data">
        <Settings.Wrapper />
        <UserWidgets />
        <Zoom.Widget />
        <Spotify.Widget />
        <Crypto.Widget />
        <Stock.Widget />
        <Music.Widget />
        <Mpd.Widget />
        <Weather.Widget />
        <Battery.Widget />
        <Mic.Widget />
        <Sound.Widget />
        <Wifi.Widget />
        <Keyboard.Widget />
        <Calendar.Widget />
        <BrowserTrack.Widget />
        <Time.Widget />
        <Dnd.Widget />
      </div>
    </div>
  );
};

export { command, refreshFrequency, render };
