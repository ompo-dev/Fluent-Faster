"use client";

import { useEffect, useRef, useState } from "react";

export function usePWAUpdate() {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const isReloadingRef = useRef(false);
	const hasCheckedInitialRef = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			return;
		}
		if (process.env.NODE_ENV === "development") {
			return;
		}

		let _registration: ServiceWorkerRegistration | null = null;
		let updateInterval: NodeJS.Timeout | null = null;
		let visibilityHandler: (() => void) | null = null;
		let messageHandler: ((event: MessageEvent) => void) | null = null;

		// Check if Service Worker file is accessible before registering
		const registerSW = async () => {
			try {
				// First, check if file exists
				const response = await fetch("/sw.js", { method: "HEAD" });
				if (!response.ok) {
					console.warn("⚠️ Service Worker not found, skipping registration");
					return;
				}

				// Register the service worker
				const reg = await navigator.serviceWorker.register("/sw.js", {
					scope: "/",
				});

				_registration = reg;

				// Detect when a new worker is being installed (automatic update)
				const checkForWaitingWorker = () => {
					// In development, don't auto-update
					if (process.env.NODE_ENV === "development") {
						return;
					}

					if (reg.waiting && !isReloadingRef.current) {
						// Worker waiting to activate - show update screen
						console.log(
							"🔄 New version detected, updating automatically...",
						);
						isReloadingRef.current = true;
						setIsUpdating(true);
						// Send message to skip waiting and activate
						reg.waiting.postMessage({ type: "SKIP_WAITING" });
						// Reload after brief delay
						setTimeout(() => {
							window.location.reload();
						}, 500);
					}
				};

				// Check immediately if there's a worker waiting (pending update)
				// But only once when loading the page
				if (!hasCheckedInitialRef.current) {
					hasCheckedInitialRef.current = true;
					// Delay to avoid immediate check in development
					setTimeout(() => {
						checkForWaitingWorker();
					}, 1000);
				}

				// Listener to detect updates
				const updateFoundHandler = () => {
					const newWorker = reg.installing;
					if (!newWorker) return;

					const stateChangeHandler = () => {
						if (newWorker.state === "installed") {
							if (navigator.serviceWorker.controller) {
								// There's an active controller, so this is an update
								// In production, update automatically
								if (process.env.NODE_ENV === "production") {
									checkForWaitingWorker();
								} else {
									// In development, just notify
									console.log("🔄 New version available!");
									setUpdateAvailable(true);
								}
							} else {
								// First installation
								console.log("✅ Service Worker installed for the first time");
							}
						}
					};

					newWorker.addEventListener("statechange", stateChangeHandler);

					// Capture errors during installation
					const errorHandler = (errorEvent: ErrorEvent) => {
						console.error(
							"❌ Error during Service Worker installation:",
							errorEvent,
						);
					};
					newWorker.addEventListener("error", errorHandler);
				};

				reg.addEventListener("updatefound", updateFoundHandler);

				// Check for updates every 60 seconds (production only)
				if (process.env.NODE_ENV === "production") {
					updateInterval = setInterval(() => {
						if (!isReloadingRef.current) {
							reg.update();
						}
					}, 60000);
				}

				// Check for updates when page receives focus (production only)
				if (process.env.NODE_ENV === "production") {
					visibilityHandler = () => {
						if (!document.hidden && !isReloadingRef.current) {
							reg.update();
						}
					};
					document.addEventListener("visibilitychange", visibilityHandler);
				}

				// Listener for messages from service worker
				messageHandler = (event: MessageEvent) => {
					if (event.data && event.data.type === "SW_UPDATED") {
						console.log("✅ Service Worker updated:", event.data.version);

						// In development, just log and don't reload
						if (process.env.NODE_ENV === "development") {
							console.log(
								"ℹ️ In development: update detected but not applied automatically",
							);
							return;
						}

						// Avoid multiple reloads
						if (isReloadingRef.current) {
							return;
						}

						// Show update screen before reloading
						isReloadingRef.current = true;
						setIsUpdating(true);
						// Reload the page to apply new version after brief delay
						setTimeout(() => {
							window.location.reload();
						}, 500);
					}
				};
				navigator.serviceWorker.addEventListener("message", messageHandler);

				console.log("✅ Service Worker registered successfully");
			} catch (error) {
				console.error("❌ Error registering Service Worker:", {
					error,
					message: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					name: error instanceof Error ? error.name : undefined,
				});
			}
		};

		// Wait for page to fully load before registering
		if (document.readyState === "complete") {
			registerSW();
		} else {
			window.addEventListener("load", registerSW);
		}

		// Cleanup
		return () => {
			if (updateInterval) {
				clearInterval(updateInterval);
			}
			if (visibilityHandler) {
				document.removeEventListener("visibilitychange", visibilityHandler);
			}
			if (messageHandler) {
				navigator.serviceWorker.removeEventListener("message", messageHandler);
			}
		};
	}, []);

	const applyUpdate = async () => {
		if (
			!("serviceWorker" in navigator) ||
			!navigator.serviceWorker.controller ||
			isReloadingRef.current
		) {
			return;
		}

		isReloadingRef.current = true;
		setIsUpdating(true);

		try {
			// Send message to service worker to skip waiting
			const registration = await navigator.serviceWorker.getRegistration();
			if (registration?.waiting) {
				registration.waiting.postMessage({ type: "SKIP_WAITING" });
			}

			// Force page reload after brief delay
			setTimeout(() => {
				window.location.reload();
			}, 100);
		} catch (error) {
			console.error("❌ Error applying update:", error);
			isReloadingRef.current = false;
			setIsUpdating(false);
		}
	};

	return {
		updateAvailable,
		isUpdating,
		applyUpdate,
	};
}
