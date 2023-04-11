import * as Uebersicht from "uebersicht";
import * as Specter from "./components/data/specter.jsx";
import * as Utils from "./utils.js";

export const styles = /* css */ `
.data-widget {
  display: flex;
  align-items: center;
  margin: var(--item-outer-margin);
  padding: var(--item-inner-margin);
  color: var(--background);
  font-family: var(--font);
  font-size: inherit;
  background-color: var(--minor);
  text-decoration: none;
  white-space: nowrap;
  border-radius: var(--item-radius);
  border: 0;
  outline: none;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: var(--light-shadow);
  transition: all 160ms var(--transition-easing);
}
.simple-bar--no-bar-background .simple-bar__data {
  padding: 4px 5px 4px 0;
  background-color: var(--background);
  box-shadow: var(--light-shadow);
  border-radius: var(--bar-radius);
}
.simple-bar--no-color-in-data .data-widget {
  color: var(--foreground);
  background-color: var(--minor);
}
.simple-bar--widgets-background-color-as-foreground .data-widget {
  background-color: transparent;
  box-shadow: none;
}
.simple-bar--widgets-background-color-as-foreground.simple-bar--no-color-in-data .data-widget {
  color: var(--foreground) !important;
  background-color: transparent;
}
.data-widget--clickable {
  cursor: pointer;
}
.data-widget--clickable:hover {
  box-shadow: var(--light-shadow), var(--hover-ring);
}
.data-widget--clickable:active {
  box-shadow: var(--light-shadow), var(--focus-ring);
}
.data-widget > svg {
  width: 14px;
  height: 14px;
  margin-right: 7px;
  fill: currentColor;
}
.data-widget__inner {
  max-width: var(--item-max-width);
  display: flex;
  flew-wrap: nowrap;
  overflow: hidden;
}
.data-widget__slider {
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition: transform 160ms var(--transition-easing);
}
`;


const getTag = (onClick, href) => {
  if (href) return "a";
  if (onClick) return "button";
  return "div";
};

const isMiddleClick = (e) => {
  return e.button === 1 || e["button&2"] === 1;
};

const Inner = ({ disableSlider, children }) => {
  if (disableSlider) return children;
  return (
    <div className="data-widget__inner">
      <div className="data-widget__slider">{children}</div>
    </div>
  );
};

export const Widget = ({
  Icon,
  classes,
  href,
  onClick,
  onRightClick,
  onMiddleClick,
  style,
  disableSlider,
  showSpecter,
  children,
}) => {
  const ref = Uebersicht.React.useRef();
  const Tag = getTag(onClick, href);
  const dataWidgetClasses = Utils.classnames("data-widget", classes, {
    "data-widget--clickable": onClick,
  });

  const onClickProp = (e) => {
    const { metaKey } = e;
    const action = metaKey || isMiddleClick(e) ? onMiddleClick : onClick;
    if (action) action(e);
  };

  const onMouseEnter = () =>
    Utils.startSliding(
      ref.current,
      ".data-widget__inner",
      ".data-widget__slider"
    );
  const onMouseLeave = () =>
    Utils.stopSliding(ref.current, ".data-widget__slider");

  return (
    <Tag
      ref={ref}
      className={dataWidgetClasses}
      href={href}
      onClick={onClickProp}
      onContextMenu={onRightClick || undefined}
      onMouseEnter={!disableSlider ? onMouseEnter : undefined}
      onMouseLeave={!disableSlider ? onMouseLeave : undefined}
      style={style}
    >
      {Icon && <Icon />}
      {showSpecter && <Specter.Widget />}
      <Inner disableSlider={disableSlider}>{children}</Inner>
    </Tag>
  );
};
