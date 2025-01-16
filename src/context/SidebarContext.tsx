"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarSettings = { disabled: boolean; isHoverOpen: boolean };
type SidebarContextType = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsHover: (isHover: boolean) => void;
  getOpenState: () => boolean;
  setSettings: (settings: Partial<SidebarSettings>) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const [settings, setSettings] = useState<SidebarSettings>({ disabled: false, isHoverOpen: false });

  const toggleOpen = () => {
    console.log(isOpen,"mmm")
    setIsOpen(!isOpen);
  };

  const getOpenState = () => {
    return isOpen || (settings.isHoverOpen && isHover);
  };

  const updateSettings = (newSettings: Partial<SidebarSettings>) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isHover,
        settings,
        toggleOpen,
        setIsOpen,
        setIsHover,
        getOpenState,
        setSettings: updateSettings,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};