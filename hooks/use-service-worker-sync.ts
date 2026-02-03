/**
 * Hook for managing Service Worker synchronization
 *
 * Listens for messages from Service Worker about synchronization
 * and provides status and controls for manual synchronization
 */

"use client";

import { useCallback, useEffect, useState } from "react";

interface SyncStatus {
	isSyncing: boolean;
	lastSyncTime: number | null;
	lastSyncResult: {
		synced: number;
		failed: number;
		total: number;
	} | null;
}

/**
 * Hook for managing Service Worker synchronization
 */
export function useServiceWorkerSync() {
	const [syncStatus, setSyncStatus] = useState<SyncStatus>({
		isSyncing: false,
		lastSyncTime: null,
		lastSyncResult: null,
	});

	// Listen for messages from Service Worker
	useEffect(() => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			if (event.data && event.data.type === "SYNC_COMPLETE") {
				setSyncStatus((prev) => ({
					...prev,
					isSyncing: false,
					lastSyncTime: Date.now(),
					lastSyncResult: {
						synced: event.data.synced || 0,
						failed: event.data.failed || 0,
						total: event.data.total || 0,
					},
				}));
			}
		};

		navigator.serviceWorker.addEventListener("message", handleMessage);

		return () => {
			navigator.serviceWorker.removeEventListener("message", handleMessage);
		};
	}, []);

	/**
	 * Force manual synchronization
	 */
	const syncNow = useCallback(async () => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			return;
		}

		try {
			setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

			const registration = await navigator.serviceWorker.ready;

			// Try to use Background Sync if available
			if ("sync" in registration) {
				await (registration as any).sync.register("sync-queue");
			} else {
				// Fallback: send message to Service Worker
				if (registration.active) {
					registration.active.postMessage({ type: "SYNC_NOW" });
				}
			}
		} catch (error) {
			console.error("[useServiceWorkerSync] Error syncing:", error);
			setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
		}
	}, []);

	return {
		...syncStatus,
		syncNow,
	};
}
