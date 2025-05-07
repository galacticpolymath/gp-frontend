import styled, { keyframes } from 'styled-components';
import { useRandomInterval } from '../customHooks/useInterval';
import React, { CSSProperties, useState } from 'react';
import { usePrefersReducedMotion } from '../customHooks/usePrefersReducedMotions';
import { random } from '../shared/fns';

const COLOR_OPTS = {
  purple: '#6812D1',
  pink: '#ff3DAC',
} as const;

type TSparkleColor = '#6812D1' | '#ff3DAC';

const generateSparkle = (color: TSparkleColor) => {
  const sparkle = {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(10, 20),
    style: {
      top: `${random(0, 100)}%`,
      left: `${random(0, 100)}%`,
    },
  };

  return sparkle;
};

interface IProps {
  color: keyof typeof COLOR_OPTS;
  children?: React.ReactNode;
  sparkleWrapperStyle: CSSProperties;
}

const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;

const comeInOut = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(180deg);
  }
`;

const SparkleWrapper = styled.span`
  position: absolute;
  display: block;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${comeInOut} 700ms forwards;
  }
`;

const SparkleSvg = styled.svg`
  display: block;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${spin} 100ms linear;
  }
`;

const ChildWrapper = styled.strong`
  position: relative;
  z-index: 1;
  font-weight: bold;
`;

const Sparkle = ({ size, color, style }: any) => {
  const path =
    'M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z';

  return (
    <SparkleWrapper style={style}>
      <SparkleSvg
        width={size}
        height={size}
        viewBox="0 0 68 68"
        fill="none"
      >
        <path d={path} fill={color} />
      </SparkleSvg>
    </SparkleWrapper>
  );
};

const Sparkles = ({
  color,
  children,
  sparkleWrapperStyle,
  ...delegated
}: IProps) => {
  const [sparkles, setSparkles] = useState(() => {
    return Array.from({ length: 1000 }).map(() =>
      generateSparkle(COLOR_OPTS[color])
    );
  });

  usePrefersReducedMotion();

  useRandomInterval(
    () => {
      const sparkle = generateSparkle(COLOR_OPTS[color]);

      const now = Date.now();

      const nextSparkles = sparkles.filter((sp) => {
        const delta = now - sp.createdAt;
        return delta < 750;
      });

      nextSparkles.push(sparkle);

      setSparkles(nextSparkles);
    },
    0,
    200
  );

  return (
    <Wrapper style={sparkleWrapperStyle} {...delegated}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={25}
          style={sparkle.style}
        />
      ))}
      <ChildWrapper>{children}</ChildWrapper>
    </Wrapper>
  );
};

export default Sparkles;