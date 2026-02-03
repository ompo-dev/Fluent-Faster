/**
 * Utilities for detecting if the app is running as a PWA
 */

/**
 * Detects if the app is running in standalone mode (installed PWA)
 * @returns true if in standalone/PWA mode
 */
export function isStandaloneMode(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	// iOS Safari
	if (
		(window.navigator as any).standalone === true ||
		window.matchMedia("(display-mode: standalone)").matches ||
		window.matchMedia("(display-mode: fullscreen)").matches ||
		window.matchMedia("(display-mode: minimal-ui)").matches
	) {
		return true;
	}

	// Android Chrome
	if (window.matchMedia("(display-mode: standalone)").matches) {
		return true;
	}

	// Check if in standalone mode via user agent and window features
	// Some browsers don't support matchMedia, so use heuristics
	const isStandalone =
		window.matchMedia("(display-mode: standalone)").matches ||
		(window.navigator as any).standalone === true ||
		document.referrer.includes("android-app://");

	return isStandalone;
}

/**
 * Detects if the app is running in a mobile browser
 * @returns true if on mobile device
 */
export function isMobileDevice(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		window.navigator.userAgent,
	);
}

/**
 * Detects if the app is running on iOS
 * @returns true if on iOS
 */
export function isIOS(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

/**
 * Detects if the app is running on Android
 * @returns true if on Android
 */
export function isAndroid(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return /Android/.test(window.navigator.userAgent);
}
