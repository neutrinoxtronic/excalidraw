import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  RefObject,
} from "react";
import { Island } from ".././Island";
import { atom, useSetAtom } from "jotai";
import { jotaiScope } from "../../jotai";
import {
  SidebarPropsContext,
  SidebarProps,
  SidebarPropsContextValue,
} from "./common";
import { SidebarHeader } from "./SidebarHeader";
import clsx from "clsx";
import {
  useDevice,
  useExcalidrawAppState,
  useExcalidrawSetAppState,
} from "../App";
import { updateObject } from "../../utils";
import * as RadixTabs from "@radix-ui/react-tabs";
import { KEYS } from "../../keys";
import { EVENT } from "../../constants";
import { SidebarTrigger } from "./SidebarTrigger";
import { useUIAppState } from "../../context/ui-appState";
import { SidebarTabName } from "../../types";

import "./Sidebar.scss";

// FIXME replace this with the implem from ColorPicker once it's merged
const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  cb: (event: MouseEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      if (
        event.target instanceof Element &&
        (ref.current.contains(event.target) ||
          !document.body.contains(event.target))
      ) {
        return;
      }

      cb(event);
    };
    document.addEventListener("pointerdown", listener, false);

    return () => {
      document.removeEventListener("pointerdown", listener);
    };
  }, [ref, cb]);
};

/**
 * Flags whether the currently rendered Sidebar is docked or not, for use
 * in upstream components that need to act on this (e.g. LayerUI to shift the
 * UI). We use an atom because of potential host app sidebars (for the default
 * sidebar we could just read from appState.isSidebarDocked).
 *
 * Since we can only render one Sidebar at a time, we can use a simple flag.
 */
export const isSidebarDockedAtom = atom(false);

export const SidebarInner = forwardRef(
  (
    {
      name,
      children,
      onDock,
      docked,
      dockable = docked !== undefined,
      className,
      onToggle,
      ...rest
    }: SidebarProps & Omit<React.RefAttributes<HTMLDivElement>, "onSelect">,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    if (
      process.env.NODE_ENV === "development" &&
      dockable &&
      onDock === undefined
    ) {
      console.warn(
        "When Sidebar's `docked` prop is set and `dockable` isn't set to false, `onDock` must be provided as you should listen to state changes and update `docked` accordingly. As such we're defaulting `dockabled` to false, otherwise the dock button will be rendered but won't do anything. Either provide `onDock` or set `dockable` to false to hide this message.",
      );
      dockable = false;
    }

    const onToggleRef = useRef(onToggle);
    onToggleRef.current = onToggle;

    useEffect(() => {
      onToggleRef.current?.(true);
      return () => {
        onToggleRef.current?.(false);
      };
    }, [name]);

    const setAppState = useExcalidrawSetAppState();

    const setIsSidebarDockedAtom = useSetAtom(isSidebarDockedAtom, jotaiScope);

    useLayoutEffect(() => {
      setIsSidebarDockedAtom(!!docked);
      return () => {
        setIsSidebarDockedAtom(false);
      };
    }, [setIsSidebarDockedAtom, docked]);

    const headerPropsRef = useRef<SidebarPropsContextValue>(
      {} as SidebarPropsContextValue,
    );
    headerPropsRef.current.onCloseRequest = () => {
      setAppState({ openSidebar: null });
    };
    headerPropsRef.current.onDock = (isDocked) => onDock?.(isDocked);
    // renew the ref object if the following props change since we want to
    // rerender. We can't pass down as component props manually because
    // the <Sidebar.Header/> can be rendered upstream.
    headerPropsRef.current = updateObject(headerPropsRef.current, {
      docked,
      dockable,
    });

    const islandRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => {
      return islandRef.current!;
    });

    const device = useDevice();

    const closeLibrary = useCallback(() => {
      const isDialogOpen = !!document.querySelector(".Dialog");

      // Prevent closing if any dialog is open
      if (isDialogOpen) {
        return;
      }
      setAppState({ openSidebar: null });
    }, [setAppState]);

    useOnClickOutside(
      islandRef,
      useCallback(
        (event) => {
          // If click on the library icon, do nothing so that LibraryButton
          // can toggle library menu
          if ((event.target as Element).closest(".sidebar-trigger")) {
            return;
          }
          if (!docked || !device.canDeviceFitSidebar) {
            closeLibrary();
          }
        },
        [closeLibrary, docked, device.canDeviceFitSidebar],
      ),
    );

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === KEYS.ESCAPE &&
          (!docked || !device.canDeviceFitSidebar)
        ) {
          closeLibrary();
        }
      };
      document.addEventListener(EVENT.KEYDOWN, handleKeyDown);
      return () => {
        document.removeEventListener(EVENT.KEYDOWN, handleKeyDown);
      };
    }, [closeLibrary, docked, device.canDeviceFitSidebar]);

    return (
      <Island
        {...rest}
        className={clsx(
          "layer-ui__sidebar",
          { "layer-ui__sidebar--docked": docked },
          className,
        )}
        ref={islandRef}
      >
        <SidebarPropsContext.Provider value={headerPropsRef.current}>
          {children}
        </SidebarPropsContext.Provider>
      </Island>
    );
  },
);
SidebarInner.displayName = "SidebarInner";

const SidebarTabs = ({
  children,
  defaultTab,
  ...rest
}: {
  children: React.ReactNode;
  defaultTab: string;
} & Omit<React.RefAttributes<HTMLDivElement>, "onSelect">) => {
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();

  if (!appState.openSidebar) {
    return null;
  }

  const { name } = appState.openSidebar;

  return (
    <RadixTabs.Root
      className="sidebar-tabs-root"
      defaultValue={defaultTab}
      value={appState.openSidebar.tab}
      onValueChange={(tab) =>
        setAppState((state) => ({
          ...state,
          openSidebar: { ...state.openSidebar, name, tab },
        }))
      }
      {...rest}
    >
      {children}
    </RadixTabs.Root>
  );
};
SidebarTabs.displayName = "SidebarTabs";

const SidebarTabTriggers = ({
  children,
  ...rest
}: { children: React.ReactNode } & Omit<
  React.RefAttributes<HTMLDivElement>,
  "onSelect"
>) => {
  return (
    <RadixTabs.List className="sidebar-triggers" {...rest}>
      {children}
    </RadixTabs.List>
  );
};
SidebarTabTriggers.displayName = "SidebarTabTriggers";

const SidebarTabTrigger = ({
  children,
  tab,
  onSelect,
  ...rest
}: {
  children: React.ReactNode;
  tab: SidebarTabName;
  onSelect?: React.ReactEventHandler<HTMLButtonElement> | undefined;
} & Omit<React.HTMLAttributes<HTMLButtonElement>, "onSelect">) => {
  return (
    <RadixTabs.Trigger value={tab} asChild onSelect={onSelect}>
      <button
        type={"button"}
        className={`excalidraw-button sidebar-tab-trigger`}
        {...rest}
      >
        {children}
      </button>
    </RadixTabs.Trigger>
  );
};
SidebarTabTrigger.displayName = "SidebarTabTrigger";

const SidebarTab = ({
  tab,
  children,
  ...rest
}: {
  tab: SidebarTabName;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <RadixTabs.Content {...rest} value={tab}>
      {children}
    </RadixTabs.Content>
  );
};
SidebarTab.displayName = "SidebarTab";

export const Sidebar = Object.assign(
  forwardRef((props: SidebarProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const appState = useExcalidrawAppState();

    const { onStateChange } = props;

    const refPrevOpenSidebar = useRef(appState.openSidebar);
    useEffect(() => {
      if (appState.openSidebar !== refPrevOpenSidebar.current) {
        refPrevOpenSidebar.current = appState.openSidebar;
        onStateChange?.(appState.openSidebar);
      }
    }, [appState.openSidebar, onStateChange]);

    const [mounted, setMounted] = useState(false);
    useLayoutEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // We want to render in the next tick (hence `mounted` flag) so that it's
    // guaranteed to happen after unmount of the previous sidebar (in case the
    // previous sidebar is mounted after the next one). This is necessary to
    // prevent flicker of subcomponents that support fallbacks
    // (e.g. SidebarHeader). This is because we're using flags to determine
    // whether prefer the fallback component or not (otherwise both will render
    // initially), and the flag won't be reset in time if the unmount order
    // it not correct.
    //
    // Alternative, and more general solution would be to namespace the fallback
    // HoC so that state is not shared between subcomponents when the wrapping
    // component is of the same type (e.g. Sidebar -> SidebarHeader).
    const shouldRender = mounted && appState.openSidebar?.name === props.name;

    if (!shouldRender) {
      return null;
    }

    return <SidebarInner {...props} ref={ref} key={props.name} />;
  }),
  {
    Header: SidebarHeader,
    TabTriggers: SidebarTabTriggers,
    TabTrigger: SidebarTabTrigger,
    Tabs: SidebarTabs,
    Tab: SidebarTab,
    Trigger: SidebarTrigger,
  },
);
Sidebar.displayName = "Sidebar";
