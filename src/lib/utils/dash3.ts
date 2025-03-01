/**
 * Utility functions to support both Dash 2 and Dash 3 components
 */

import React from "react";

// Define interfaces for Dash types
interface DashBaseProps {
  loading_state?: {
    is_loading: boolean;
    component_name: string;
    prop_name: string;
  };
  id?: string;
  setProps?: (props: Record<string, any>) => void;
  componentPath?: string;
}

// Declare type augmentations for window object
declare global {
  interface Window {
    dash_component_api?: {
      getLayout: (componentPath: string) => any;
      useDashContext: () => {
        useLoading: () => boolean;
        isLoading: () => boolean;
        useStore: () => any;
        useDispatch: () => any;
      };
    };
    dash_clientside?: {
      set_props: (componentPathOrId: string, props: Record<string, any>) => void;
    };
  }
}

/**
 * Check if running in Dash 3 environment
 */
export const isDash3 = (): boolean => {
  return !!(typeof window !== 'undefined' && 'dash_component_api' in window);
};

/**
 * Set persistence properties for a component
 */
export const setPersistence = (Component: any, props: string[] = ["value"]): void => {
  const persistence = { persisted_props: props, persistence_type: "local" };

  parseFloat(React.version) < 18.3
    ? (Component.defaultProps = persistence)
    : (Component.dashPersistence = persistence);
};

/**
 * Get loading state, either from Dash 3 context or props
 */
export const getLoadingState = (loading_state?: DashBaseProps["loading_state"]): boolean => {
  if (isDash3() && typeof window !== 'undefined' && window.dash_component_api) {
    try {
      return window.dash_component_api.useDashContext().useLoading();
    } catch (e) {
      // Fallback to props-based loading state
      return loading_state?.is_loading ?? false;
    }
  }
  return loading_state?.is_loading ?? false;
};

/**
 * Get component layout info, works with both Dash 2 and 3
 */
export const getChildLayout = (child: any): { type: any; props: any } => {
  if (isDash3() && typeof window !== 'undefined' && window.dash_component_api) {
    if (child.props && child.props.componentPath) {
      try {
        return window.dash_component_api.getLayout(child.props.componentPath);
      } catch (e) {
        return { type: null, props: {} };
      }
    }
    return { type: null, props: {} };
  }

  return {
    type: child.props?._dashprivate_layout?.type,
    props: child.props?._dashprivate_layout?.props,
  };
};

/**
 * Get child props from layout
 */
export const getChildProps = (child: any): any => {
  return getChildLayout(child).props;
};

/**
 * Set component props, compatible with Dash 3
 */
export const setProps = (componentPath: string, props: Record<string, any>): void => {
  if (isDash3() && typeof window !== 'undefined' && window.dash_clientside) {
    window.dash_clientside.set_props(componentPath, props);
  }
};

/**
 * Use Dash 3 store if available
 */
export const useStore = () => {
  if (isDash3() && typeof window !== 'undefined' && window.dash_component_api) {
    try {
      return window.dash_component_api.useDashContext().useStore();
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Use Dash 3 dispatch if available
 */
export const useDispatch = () => {
  if (isDash3() && typeof window !== 'undefined' && window.dash_component_api) {
    try {
      return window.dash_component_api.useDashContext().useDispatch();
    } catch (e) {
      return null;
    }
  }
  return null;
};