"use client";
import { useState, useEffect } from "react";

// Define breakpoints
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

type DeviceType = "mobile" | "tablet" | "desktop";

const getDeviceType = (width: number): DeviceType => {
  if (width >= breakpoints.desktop) {
    return "desktop";
  } else if (width >= breakpoints.tablet) {
    return "tablet";
  } else {
    return "mobile";
  }
};

const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType(1200));

  useEffect(() => {
    if (!window) return;
    const handleResize = () => {
      setDeviceType(getDeviceType(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return deviceType;
};

export default useDeviceType;
