import { IJsonModel } from "flexlayout-react";

interface TabCount {
  total: number;
  borderTabs: number;
  layoutTabs: number;
}

/**
 * Count the number of tabs in a FlexLayout model
 * @param model The FlexLayout JSON model
 * @returns Object containing tab counts
 */
export function countTabs(model: IJsonModel): TabCount {
  const result: TabCount = {
    total: 0,
    borderTabs: 0,
    layoutTabs: 0
  };

  // Count tabs in borders
  if (model.borders) {
    for (const border of model.borders) {
      if (border.children) {
        // Count tabs in border children
        for (const child of border.children) {
          if (child.type === 'tab') {
            result.borderTabs++;
            result.total++;
          }
        }
      }
    }
  }

  // Count tabs in main layout
  if (model.layout) {
    result.layoutTabs = countTabsInLayout(model.layout);
    result.total += result.layoutTabs;
  }

  return result;
}

/**
 * Recursively count tabs in a layout node
 * @param node Layout node (row, tabset, or tab)
 * @returns Number of tabs found
 */
function countTabsInLayout(node: any): number {
  if (!node) {
    return 0;
  }

  if (node.type === 'tab') {
    return 1;
  }

  let count = 0;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countTabsInLayout(child);
    }
  }

  return count;
}

/**
 * Check if the model exceeds the free tier limit
 * @param model FlexLayout model to check
 * @param freeLimit Maximum number of tabs allowed in free tier
 * @returns True if model exceeds the free limit
 */
export function exceedsFreeTierLimit(model: IJsonModel, freeLimit: number = 3): boolean {
  const counts = countTabs(model);
  return counts.total > freeLimit;
}

/**
 * Apply free tier limitations to a FlexLayout model
 * This will limit the number of tabs to the free tier limit
 * @param model The original model
 * @param freeLimit Maximum number of tabs allowed (default: 3)
 * @returns A new model with tabs limited to the free tier
 */
export function limitModelToFreeTier(model: IJsonModel, freeLimit: number = 3): IJsonModel {
  // Deep clone the model to avoid modifying the original
  const limitedModel: IJsonModel = JSON.parse(JSON.stringify(model));

  let remainingTabs = freeLimit;

  // First handle borders, if present
  if (limitedModel.borders && limitedModel.borders.length > 0) {
    for (const border of limitedModel.borders) {
      if (border.children && border.children.length > 0) {
        // If we have no more tabs allowed, remove all tabs from this border
        if (remainingTabs <= 0) {
          border.children = [];
          continue;
        }

        // Otherwise, limit the number of tabs in this border
        const tabsInBorder = border.children.filter(child => child.type === 'tab');
        if (tabsInBorder.length > remainingTabs) {
          // Keep only the allowed number of tabs
          border.children = border.children.filter(child => child.type !== 'tab');
          border.children.push(...tabsInBorder.slice(0, remainingTabs));
          remainingTabs = 0;
        } else {
          remainingTabs -= tabsInBorder.length;
        }
      }
    }
  }

  // If we have tabs remaining, apply limits to the main layout
  if (remainingTabs > 0 && limitedModel.layout) {
    limitedModel.layout = limitLayoutNode(limitedModel.layout, remainingTabs);
  } else if (remainingTabs <= 0 && limitedModel.layout) {
    // If no tabs remaining, remove all tabs from layout
    // But keep the basic structure to avoid breaking the layout
    limitedModel.layout = createEmptyLayoutNode(limitedModel.layout.type);
  }

  return limitedModel;
}

/**
 * Recursively limit tabs in a layout node
 * @param node Layout node to process
 * @param maxTabs Maximum number of tabs allowed
 * @returns Limited layout node
 */
function limitLayoutNode(node: any, maxTabs: number): any {
  if (!node) return null;

  // If this is a tab, count it
  if (node.type === 'tab') {
    if (maxTabs > 0) {
      maxTabs--;
      return node;
    }
    return null;
  }

  // Handle tabsets - these contain tabs directly
  if (node.type === 'tabset' && node.children) {
    const tabs = node.children.filter((child: any) => child.type === 'tab');

    if (tabs.length <= maxTabs) {
      // All tabs fit within limit
      maxTabs -= tabs.length;
      return node;
    } else {
      // We need to limit the tabs
      const limitedNode = { ...node };
      limitedNode.children = tabs.slice(0, maxTabs);
      maxTabs = 0;
      return limitedNode;
    }
  }

  // Handle rows and other container types
  if (node.children && Array.isArray(node.children)) {
    const newChildren = [];
    let remainingTabs = maxTabs;

    for (const child of node.children) {
      if (remainingTabs <= 0) break;

      const limitedChild = limitLayoutNode({ ...child }, remainingTabs);
      if (limitedChild) {
        // Calculate how many tabs were used in this child
        const childTabCount = countTabsInLayout(limitedChild);
        remainingTabs -= childTabCount;
        newChildren.push(limitedChild);
      }
    }

    return {
      ...node,
      children: newChildren.length > 0 ? newChildren : [createEmptyLayoutNode('tabset')]
    };
  }

  return node;
}

/**
 * Create an empty layout node of the specified type
 * @param type Type of node to create (tabset, row, etc)
 * @returns Empty layout node
 */
function createEmptyLayoutNode(type: string): any {
  if (type === 'tabset') {
    return {
      type: 'tabset',
      weight: 100,
      children: []
    };
  }

  if (type === 'row' || type === 'column') {
    return {
      type,
      weight: 100,
      children: [createEmptyLayoutNode('tabset')]
    };
  }

  // Default fallback
  return {
    type: 'row',
    weight: 100,
    children: [createEmptyLayoutNode('tabset')]
  };
}