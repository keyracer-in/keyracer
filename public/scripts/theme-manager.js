/**
 * Theme Manager
 * 
 * Handles theme switching between light, dark, and auto modes
 * Persists user preference to localStorage
 * Supports system preference detection
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'keyracer-theme-preference';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    };
    
    // Initialize theme on load
    this.init();
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Load saved preference or default to auto
    const savedTheme = this.getSavedTheme();
    this.applyTheme(savedTheme);
    
    // Listen for system theme changes when in auto mode
    this.watchSystemTheme();
    
    // Listen for storage changes (sync across tabs)
    this.watchStorageChanges();
  }
  
  /**
   * Get saved theme preference from localStorage
   * @returns {string} Theme preference (light, dark, or auto)
   */
  getSavedTheme() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && Object.values(this.THEMES).includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
    return this.THEMES.AUTO; // Default to auto
  }
  
  /**
   * Save theme preference to localStorage
   * @param {string} theme - Theme to save
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }
  
  /**
   * Get system theme preference
   * @returns {string} 'light' or 'dark'
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.THEMES.DARK;
    }
    return this.THEMES.LIGHT;
  }
  
  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply (light, dark, or auto)
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove existing theme attribute
    root.removeAttribute('data-theme');
    
    // Determine actual theme to apply
    let actualTheme = theme;
    if (theme === this.THEMES.AUTO) {
      actualTheme = this.getSystemTheme();
    }
    
    // Apply theme attribute
    if (actualTheme === this.THEMES.DARK) {
      root.setAttribute('data-theme', 'dark');
    }
    // Light theme is default, no attribute needed
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(actualTheme);
    
    // Dispatch custom event for other components
    this.dispatchThemeChange(theme, actualTheme);
  }
  
  /**
   * Update meta theme-color for mobile browsers
   * @param {string} theme - Current theme
   */
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Set color based on theme
    const color = theme === this.THEMES.DARK ? '#0a0a0f' : '#fafafa';
    metaThemeColor.content = color;
  }
  
  /**
   * Set theme and save preference
   * @param {string} theme - Theme to set (light, dark, or auto)
   */
  setTheme(theme) {
    if (!Object.values(this.THEMES).includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.saveTheme(theme);
    this.applyTheme(theme);
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const currentTheme = this.getSavedTheme();
    const currentActualTheme = currentTheme === this.THEMES.AUTO 
      ? this.getSystemTheme() 
      : currentTheme;
    
    const newTheme = currentActualTheme === this.THEMES.LIGHT 
      ? this.THEMES.DARK 
      : this.THEMES.LIGHT;
    
    this.setTheme(newTheme);
  }
  
  /**
   * Get current theme preference
   * @returns {string} Current theme preference
   */
  getCurrentTheme() {
    return this.getSavedTheme();
  }
  
  /**
   * Get actual applied theme (resolves auto to light/dark)
   * @returns {string} Actual theme (light or dark)
   */
  getActualTheme() {
    const theme = this.getCurrentTheme();
    if (theme === this.THEMES.AUTO) {
      return this.getSystemTheme();
    }
    return theme;
  }
  
  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', (e) => {
        // Only react if in auto mode
        if (this.getCurrentTheme() === this.THEMES.AUTO) {
          this.applyTheme(this.THEMES.AUTO);
        }
      });
    }
    // Legacy browsers
    else if (darkModeQuery.addListener) {
      darkModeQuery.addListener((e) => {
        if (this.getCurrentTheme() === this.THEMES.AUTO) {
          this.applyTheme(this.THEMES.AUTO);
        }
      });
    }
  }
  
  /**
   * Watch for storage changes (sync across tabs)
   */
  watchStorageChanges() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY && e.newValue) {
        this.applyTheme(e.newValue);
      }
    });
  }
  
  /**
   * Dispatch theme change event
   * @param {string} preference - User's theme preference
   * @param {string} actual - Actual applied theme
   */
  dispatchThemeChange(preference, actual) {
    const event = new CustomEvent('themechange', {
      detail: {
        preference,
        actual,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Check if dark mode is active
   * @returns {boolean} True if dark mode is active
   */
  isDarkMode() {
    return this.getActualTheme() === this.THEMES.DARK;
  }
  
  /**
   * Check if light mode is active
   * @returns {boolean} True if light mode is active
   */
  isLightMode() {
    return this.getActualTheme() === this.THEMES.LIGHT;
  }
  
  /**
   * Check if auto mode is enabled
   * @returns {boolean} True if auto mode is enabled
   */
  isAutoMode() {
    return this.getCurrentTheme() === this.THEMES.AUTO;
  }
}

// Create global instance
const themeManager = new ThemeManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}

// Make available globally
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;
