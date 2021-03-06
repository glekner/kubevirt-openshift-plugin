import * as React from 'react';

import { getImageForIconClass } from '@kubevirt-internal';
import { createSvgIdUrl, useSize } from '@patternfly/react-topology';

import SvgDropShadowFilter from './SvgDropShadowFilter';

interface SvgTypedIconProps {
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
  iconClass: string;
}

const FILTER_ID = 'SvgTypedIconDropShadowFilterId';

const CircledIcon: React.FC<SvgTypedIconProps> = (
  { className, x, y, width, height, iconClass, padding = 4 },
  circleRef,
) => {
  const [typedIconSize, typedIconRef] = useSize([]);

  let iconWidth = 0;
  let iconHeight = 0;

  if (typedIconSize) {
    ({ width: iconWidth, height: iconHeight } = typedIconSize);
  }

  return (
    <g className={className}>
      <SvgDropShadowFilter id={FILTER_ID} />
      <circle
        key={`circle-${FILTER_ID}`}
        ref={circleRef}
        filter={createSvgIdUrl(FILTER_ID)}
        cx={x - iconWidth / 2}
        cy={y + iconHeight / 2}
        r={iconWidth / 2 + padding}
      />
      <g ref={typedIconRef}>
        <image
          key={`image-${FILTER_ID}`}
          x={x - iconWidth}
          y={y}
          width={width}
          height={height}
          xlinkHref={getImageForIconClass(iconClass) || iconClass}
          filter={createSvgIdUrl(FILTER_ID)}
        />
      </g>
    </g>
  );
};
const SvgCircledIcon: any = React.forwardRef(CircledIcon as any);
export default SvgCircledIcon;
