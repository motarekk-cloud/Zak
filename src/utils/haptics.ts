export type HapticStyle = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning';

/**
 * Triggers subtle vibration feedback using the Web Vibration API.
 * Safely executes only upon user interactions and respects user preferences.
 */
export function triggerHaptic(style: HapticStyle = 'light', enabled: boolean = true): void {
  if (!enabled) return;
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (style) {
      case 'selection':
        // Subtle micro-tap for buttons, toggles, selectors
        navigator.vibrate(10);
        break;
      case 'light':
        // Gentle tap for previous ayah or modal dismissal
        navigator.vibrate(16);
        break;
      case 'medium':
        // Physical click feedback for next ayah ("التالى") or bookmarking
        navigator.vibrate(26);
        break;
      case 'heavy':
        navigator.vibrate(42);
        break;
      case 'success':
        // Rhythmic celebration pattern when daily goal / milestone is met
        navigator.vibrate([20, 50, 25, 50, 35]);
        break;
      case 'warning':
        navigator.vibrate([30, 40, 30]);
        break;
    }
  } catch {
    // Browsers block vibration if not initiated by user gesture or in some iframes
  }
}
