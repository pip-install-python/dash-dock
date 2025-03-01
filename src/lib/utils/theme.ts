/**
 * Theme utilities for integrating with Mantine's theming system
 */

/**
 * Check if the current color scheme is dark mode
 * @returns boolean indicating if dark mode is active
 */
export const isDarkMode = (): boolean => {
  if (typeof document === 'undefined') return false;

  // First check if the document has the Mantine color scheme attribute
  const colorScheme = document.documentElement.getAttribute('data-mantine-color-scheme');
  if (colorScheme) {
    return colorScheme === 'dark';
  }

  // Fallback to media query if Mantine isn't controlling the theme
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Add a listener for theme changes (both Mantine-controlled and system)
 * @param callback Function to call when theme changes
 * @returns Cleanup function to remove listeners
 */
export const addThemeChangeListener = (callback: (isDark: boolean) => void): () => void => {
  // Observer for Mantine color scheme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-mantine-color-scheme'
      ) {
        const isDark = isDarkMode();
        callback(isDark);
      }
    });
  });

  // Start observing document element for attribute changes
  if (typeof document !== 'undefined') {
    observer.observe(document.documentElement, { attributes: true });
  }

  // Also listen for system preference changes
  const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener('change', () => {
      // Only trigger if Mantine isn't controlling the theme
      if (!document.documentElement.hasAttribute('data-mantine-color-scheme')) {
        callback(mediaQuery.matches);
      }
    });
  }

  // Return cleanup function
  return () => {
    observer.disconnect();
    if (mediaQuery?.removeEventListener) {
      mediaQuery.removeEventListener('change', () => {});
    }
  };
};

/**
 * Get Mantine CSS variable value
 * @param variableName CSS variable name without the --mantine- prefix
 * @param fallback Fallback value if variable is not found
 * @returns The value of the CSS variable
 */
export const getMantineVar = (variableName: string, fallback: string = ''): string => {
  if (typeof document === 'undefined' || !document.documentElement) return fallback;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--mantine-${variableName}`)
    .trim() || fallback;
};

/**
 * Get Mantine color value
 * @param colorName Color name (e.g., 'blue')
 * @param shade Shade number (0-9)
 * @returns The color value
 */
export const getMantineColor = (colorName: string, shade: number): string => {
  return getMantineVar(`color-${colorName}-${shade}`, '');
};

/**
 * Get Mantine primary color based on current primary color setting
 * @param shade Shade number (0-9)
 * @returns The primary color value
 */
export const getPrimaryColor = (shade: number): string => {
  // Try to get the primary color name first
  const primaryColorName = getMantineVar('primary-color', 'blue');
  return getMantineColor(primaryColorName, shade);
};

/**
 * Get theme-appropriate color for the current color scheme
 * @param lightModeColor Color to use in light mode
 * @param darkModeColor Color to use in dark mode
 * @returns The appropriate color for the current theme
 */
export const getThemeColor = (lightModeColor: string, darkModeColor: string): string => {
  return isDarkMode() ? darkModeColor : lightModeColor;
};

/**
 * CSS string to use for Mantine-compatible light/dark theme
 * This injects a small amount of CSS to set custom properties that match FlexLayout's theme with Mantine
 */
export const getMantineThemeStyles = (): string => {
  const isDark = isDarkMode();

  return `
    :root {
      --fl-background: var(${isDark ? '--mantine-color-dark-7' : '--mantine-color-gray-0'});
      --fl-border: var(${isDark ? '--mantine-color-dark-4' : '--mantine-color-gray-3'});
      --fl-selected: var(--mantine-primary-color-filled);
      --fl-selected-text: var(${isDark ? '--mantine-color-white' : '--mantine-color-white'});
      --fl-text: var(${isDark ? '--mantine-color-white' : '--mantine-color-dark-9'});
      --fl-tabbar-background: var(${isDark ? '--mantine-color-dark-6' : '--mantine-color-gray-1'});
      --fl-border-color: var(${isDark ? '--mantine-color-dark-4' : '--mantine-color-gray-3'});
      --fl-border-radius: var(--mantine-radius-sm);
      --fl-font-family: var(--mantine-font-family);
    }
  `;
};

/**
 * Apply Mantine theme to FlexLayout
 * This injects a style element into the document head with custom properties
 * @returns Cleanup function to remove the injected styles
 */
export const applyMantineThemeToFlexLayout = (): () => void => {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = getMantineThemeStyles();
  document.head.appendChild(styleElement);

  // Set up theme change listener to update styles
  const updateStyles = (isDark: boolean) => {
    styleElement.innerHTML = getMantineThemeStyles();
  };

  const cleanup = addThemeChangeListener(updateStyles);

  // Return cleanup function
  return () => {
    cleanup();
    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  };
};