import React, { useState, useEffect, useMemo } from "react";
import * as CaplinFlexLayout from "flexlayout-react";
import { IJsonModel, TabNode, Layout, Model, ITabRenderValues } from "flexlayout-react";
import { renderDashComponent } from "dash-extensions-js";

// Import FlexLayout styles and our custom theme styles
import "flexlayout-react/style/light.css";
import "../styles/theme.css";
import { isDash3, getChildLayout, getLoadingState } from "../utils/dash3";
import { checkApiKeyValidity } from "../utils/apiClient";
import { countTabs, exceedsFreeTierLimit, limitModelToFreeTier } from "../utils/tabAnalyzer";

type Props = {
  /**
   * Unique ID to identify this component in Dash callbacks.
   */
  id?: string;

  /**
   * Update props to trigger callbacks.
   */
  setProps?: (props: Record<string, any>) => void;

  /**
   * The tab font (overrides value in css).
   * Example: font={{size:"12px", style:"italic"}}
   */
  font?: any;

  /**
   * If left undefined will do simple check based on userAgent
   */
  supportsPopout?: boolean;

  /**
   * URL of popout window relative to origin, defaults to popout.html
   */
  popoutURL?: string;

  /**
   * Boolean value, defaults to false, resize tabs as splitters are dragged.
   * Warning: this can cause resizing to become choppy when tabs are slow to draw
   */
  realtimeResize?: boolean;

  /**
   * Model layout.
   */
  model: IJsonModel;

  /**
   * List of children to be rendered. Children are allocated to their respective tab
   * based on the ID of the element.
   *
   * WARNING: There is no validation done on whether the children here will be rendered in any tab.
   * If there is no matching tab for a particular ID, that element will be silently ignored in
   * rendering (although callbacks will still be applied).
   */
  children: React.ReactNode;

  /**
   * Map of headers to render for each tab. Uses the `onRenderTab` function to override
   * the default headers, where a custom header mapping is supplied.
   *
   * Note: where possible, it is likely better to use classes to style the headers, rather than
   * using this prop.
   */
  headers?: { [key: string]: React.ReactNode };

  /**
   * Flag that we should use internal state to manage the layout. If the layout is not being
   * used by dash anywhere (for example, saving and re-hydrating the layout), it is more efficient
   * to use the internal state (as this limits the number of round trips between JSON
   * and the Model object).
   *
   * WARNING: If you set this, do not expect the dash property `model` to reflect the current
   * state of the layout!
   */
  useStateForModel?: boolean;

  /**
   * Debug mode flag
   */
  debugMode?: boolean;

  /**
   * API key for premium features.
   * If provided and valid, unlocks unlimited tabs.
   * Otherwise, limits to 3 tabs in the free version.
   */
  apiKey?: string;

  /**
   * Custom API URL endpoint for key validation.
   * If not provided, uses the default endpoint.
   */
  apiUrl?: string;

  /**
   * Maximum number of tabs allowed in free version.
   * Default is 3.
   */
  freeTabLimit?: number;

  /**
   * Current color scheme, automatically detected from Mantine theme
   * If not specified, will try to auto-detect from HTML data-mantine-color-scheme
   */
  colorScheme?: 'light' | 'dark';

  /**
   * CSS styles to apply to the root container element
   */
  style?: React.CSSProperties;

  /**
   * Loading state.
   */
  loading_state?: {
    is_loading: boolean;
    component_name: string;
    prop_name: string;
  };
};

// Track API key validation status
interface ValidationState {
  isValidated: boolean;
  isValid: boolean;
  message: string;
}

const idMatches = (child: any, id: string) => {
  // For Dash 3 compatibility, use componentPath instead of _dashprivate_layout
  if (child.props) {
    if (isDash3() && child.props.componentPath) {
      const layout = getChildLayout(child);
      if (layout && layout.props && layout.props.id === id) {
        return true;
      }
    }
    // Fallback for older versions
    else if (child.props._dashprivate_layout && child.props._dashprivate_layout.props.id === id) {
      return true;
    }
    // Direct id match
    else if (child.props.id === id) {
      return true;
    }
  }

  return child.key === id;
};

const getMatchingChildren = (
  children: React.ReactNode,
  node: CaplinFlexLayout.TabNode
) => {
  const id = node.getId();
  // Convert children to array, handling both arrays and single elements
  const childArray = React.Children.toArray(children);
  // Filter to find matching children
  const matchedChildren = childArray.filter((child) => idMatches(child, id));
  return matchedChildren;
};

/**
 * DashDock is a wrapper around FlexLayout-React that provides
 * flexible docking windows for Dash applications.
 *
 * The free version allows up to 3 tabs. For unlimited tabs,
 * provide a valid API key through the apiKey prop.
 *
 * The component automatically adjusts its theme based on Mantine's theme.
 */
const DashDock = ({
  id,
  model,
  children,
  headers,
  setProps,
  useStateForModel = false,
  popoutURL = "/assets/popout.html",
  apiKey,
  apiUrl,
  freeTabLimit = 3,
  colorScheme,
  style,
  loading_state,
  debugMode = false,
  ...restProps
}: Props) => {
  // Track if we're in premium or free mode
  const [validation, setValidation] = useState<ValidationState>({
    isValidated: false,
    isValid: false,
    message: ""
  });

  // Track if we had to limit the model
  const [modelLimited, setModelLimited] = useState<boolean>(false);

  // Track current color scheme
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    colorScheme || (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark'
        ? 'dark'
        : 'light')
  );

  // Use memoized values to avoid recalculations on every render
  const tabCount = useMemo(() => countTabs(model), [model]);
  const exceedsLimit = useMemo(() => exceedsFreeTierLimit(model, freeTabLimit), [model, freeTabLimit]);

  // Hold a reference to the original model
  const [initialModel] = useState(model);

  // Use the original model for state tracking
  const [modelState, setModelState] = useState(() => Model.fromJson(model));

  // Cache the final model to use - computed once per render
  const [currentModel, setCurrentModel] = useState<Model | null>(null);

  // Listen to Mantine theme changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const detectTheme = () => {
      const htmlEl = document.documentElement;
      const theme = htmlEl.getAttribute('data-mantine-color-scheme') as 'light' | 'dark';
      if (theme && theme !== currentTheme) {
        setCurrentTheme(theme);
      }
    };

    // Initial detection
    detectTheme();

    // Set up observer to watch for attribute changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-mantine-color-scheme'
        ) {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [currentTheme]);

  // Handle model updates when validation state or props change
  useEffect(() => {
    // Get the base model
    const baseModel = setProps && !useStateForModel
      ? Model.fromJson(model)
      : modelState;

    // Handle tab limits based on validation
    if (!validation.isValid && exceedsLimit) {
      try {
        // Apply limitations by converting to JSON, limiting, and converting back
        const limitedModelJson = limitModelToFreeTier(baseModel.toJson(), freeTabLimit);
        const limitedModel = Model.fromJson(limitedModelJson);
        setCurrentModel(limitedModel);

        // Only update modelLimited if needed to avoid re-renders
        if (!modelLimited) {
          setModelLimited(true);
        }
      } catch (e) {
        console.error("Error limiting model:", e);
        setCurrentModel(baseModel);
      }
    } else {
      setCurrentModel(baseModel);

      // Only update modelLimited if needed to avoid re-renders
      if (modelLimited) {
        setModelLimited(false);
      }
    }
  }, [model, modelState, validation.isValid, exceedsLimit, freeTabLimit, modelLimited, setProps, useStateForModel]);

  // Validate API key on component load or when key changes
  useEffect(() => {
    let isMounted = true;

    const validateKey = async () => {
      try {
        if (apiKey) {
          if (debugMode) {
            console.log("DashDock: Validating API key...");
          }

          const result = await checkApiKeyValidity(apiKey, 'DashDock', tabCount.total, apiUrl);

          // Only update state if component is still mounted
          if (isMounted) {
            setValidation({
              isValidated: true,
              isValid: result.valid,
              message: result.message
            });

            if (debugMode) {
              console.log(`DashDock: API key validation result: ${result.valid ? "Valid" : "Invalid"} - ${result.message}`);
            }
          }
        } else if (isMounted) {
          setValidation({
            isValidated: true,
            isValid: false,
            message: "No API key provided"
          });

          if (exceedsLimit && debugMode) {
            console.log(
              "DashDock: You are using the free version which is limited to 3 tabs. " +
              "Get an API key for unlimited tabs at https://pip-install-python.com/pip/dash_dock"
            );
          }
        }
      } catch (error) {
        console.error("API validation error:", error);
        if (isMounted) {
          setValidation({
            isValidated: true,
            isValid: false,
            message: "Error validating API key"
          });
        }
      }
    };

    validateKey();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [apiKey, apiUrl, tabCount.total, exceedsLimit, debugMode]);

  /**
   * Whenever the model changes, if we are using dash to handle the layout,
   * we should call setProps to persist the updated layout. Otherwise
   * we do nothing and let the useState hook handle it.
   */
  const onModelChange = (updatedModel: Model) => {
    if (setProps && !useStateForModel) {
      setProps({ model: updatedModel.toJson() });
    } else {
      setModelState(updatedModel);
    }
  };

  /**
   * Customise rendering of the tab to use the `headers` map
   * if available.
   */
  const onRenderTab = (
    node: TabNode,
    renderValues: ITabRenderValues
  ) => {
    if (headers && headers[node.getId()]) {
      const header = headers[node.getId()];
      // Use dash-extensions-js for Dash components
      if (React.isValidElement(header) && (header as any).props?.namespace) {
        renderValues.content = renderDashComponent(header);
      } else {
        renderValues.content = header;
      }
    }
  };

  /**
   * Factory function to create the content for each tab
   */
  const factory = (node: CaplinFlexLayout.TabNode) => {
    const matchedChildren = getMatchingChildren(children, node);
    return <React.Fragment>{matchedChildren}</React.Fragment>;
  };

  // Check if component is in loading state - this should be safe now with our defensive code
  const isLoading = loading_state?.is_loading || false;

  // Show a warning on the console if we're limiting tabs
  useEffect(() => {
    if (modelLimited && !isLoading && debugMode) {
      console.warn(
        "DashDock: Your layout has been limited to 3 tabs because you are using the free version. " +
        "Get an API key for unlimited tabs at https://pip-install-python.com/pip/dash_dock"
      );
    }
  }, [modelLimited, isLoading, debugMode]);

  // If the model isn't ready yet, show a simple loading indicator
  if (!currentModel) {
    return <div className="dash-dock-loading" style={style}>Loading dock layout...</div>;
  }

  // Render the component
  return (
    <div className={`dash-dock-container dash-dock-${currentTheme}`} style={style}>
      {/* Show a premium indicator if using a valid API key */}
      {validation.isValid && debugMode && (
        <div className="dashdock-premium-indicator">
          DashDock Premium
        </div>
      )}

      <Layout
        model={currentModel}
        factory={factory}
        onModelChange={onModelChange}
        onRenderTab={onRenderTab}
        popoutURL={popoutURL}
        {...restProps}
      />

      {/* Show a free version indicator if not validated or invalid */}
      {!validation.isValid && exceedsLimit && modelLimited && (
        <div className="dashdock-free-indicator">
          DashDock Free (Limited to {freeTabLimit} tabs)
        </div>
      )}
    </div>
  );
};

export default DashDock;