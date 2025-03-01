// To fix import errors, rename the file from dash-types.d.ts to dash-types.ts
// This makes it easier to import consistently

// Type definitions for Dash components and API
declare interface Window {
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

// Base props that Dash provides to components
export interface DashBaseProps {
  loading_state?: {
    is_loading: boolean;
    component_name: string;
    prop_name: string;
  };
  id?: string;
  setProps?: (props: Record<string, any>) => void;
  componentPath?: string;
}