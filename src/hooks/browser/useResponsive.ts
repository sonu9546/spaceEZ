"use client";

import { Grid } from "antd";

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();

  const isMobile = !screens.sm; // width < 576
  const isTablet = screens.sm && !screens.md; // 576–768
  const isMd = screens.md; // >= 768
  const isSmallScreen = !screens.lg; // < 992
  const isDesktop = screens.lg || screens.xl || screens.xxl; // >= 992

  return {
    ...screens,
    isMobile,
    isTablet,
    isMd,
    isSmallScreen,
    isDesktop,
  };
};

export default useResponsive;
