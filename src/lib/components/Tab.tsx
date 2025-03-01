import React from "react";

type Props = {
  /**
   * Unique ID to identify this component in Dash callbacks.
   */
  id: string;

  /**
   * Children to render within Tab
   */
  children?: React.ReactNode;
};

/**
 * This is a simple component that holds content to be rendered within a Tab.
 * Takes an ID that corresponds to a particular tab in the layout.
 */
const Tab = ({ id, children }: Props) => {
  // Using default parameters instead of defaultProps for React 18 compatibility
  return <React.Fragment>{children}</React.Fragment>;
};

// No need for defaultProps as per Dash 3 changes
// Tab.defaultProps = {};

export default Tab;