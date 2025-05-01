import { random } from "cypress/types/lodash";
import styled, { keyframes } from "styled-components";
import React, { CSSProperties, useEffect } from "react";
import SparkleSvg from "../../assets/img/sparkle.svg";
import Image from "next/image";

interface IProps {
  children: React.ReactNode;
}

// bright yellow
const DEFAULT_COLOR = "hsl(50deg, 100%, 50%)";

const SparkleInstance = ({
  height = "50px",
  width = "50px",
  ...props
}: CSSProperties) => (
  <Image src={SparkleSvg} style={{ height, width, ...props }} alt="sparkle" />
);
const generateSparkle = (color = DEFAULT_COLOR) => {
  return {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    // Bright yellow color:
    color,
    size: random(10, 20),
    style: {
      // Pick a random spot in the available space
      top: random(0, 100) + "%",
      left: random(0, 100) + "%",
      // Float sparkles above sibling content
      zIndex: 2,
    },
  };
};

const sparkleAnimation = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1) rotate(90deg);
  }
  100% {
    transform: scale(0) rotate(180deg);
  }
`;
const Svg = styled.svg`
  position: absolute;
  animation: ${sparkleAnimation} 600ms forwards;
`;

const Sparkles: React.FC<IProps> = ({ children }) => {
  const sparkle = generateSparkle();
  const animation = `${sparkleAnimation} 600ms forwards`;
  return (
    <Wrapper>
      <SparkleInstance
        animation={animation}
        color={sparkle.color}
        height="50px"
        width="50px"
      />
      <ChildWrapper>{children}</ChildWrapper>
    </Wrapper>
  );
};
const growAndShrink = keyframes`
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;
const Wrapper = styled.span`
  position: relative;
  display: inline-block;
  animation: ${growAndShrink} 600ms ease-in-out forwards;
`;
const ChildWrapper = styled.strong`
  position: relative;
  z-index: 1;
  font-weight: bold;
`;

const Sparkle: React.FC<IProps> = ({ children }) => {
  const [sparkles, setSparkles] = React.useState<
    ReturnType<typeof generateSparkle>[]
  >([]);

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      const now = Date.now();
      const sparkle = generateSparkle();
      const nextSparkles = sparkles.filter((sparkle) => {
        const delta = now - sparkle.createdAt;
        return delta < 1000;
      });
      nextSparkles.push(sparkle);
      setSparkles(nextSparkles);
    }, 500);

    return () => {
      clearInterval(intervalTimer);
    };
  }, []);

  return <Sparkles>{children}</Sparkles>;
};

export default Sparkle;
