// Service Worker for PWA - FluentFaster
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `fluentfaster-${CACHE_VERSION}`;
const RUNTIME_CACHE = `fluentfaster-runtime-${CACHE_VERSION}`;
const OFFLINE_QUEUE_DB = "offline-queue";

// Static assets for cache
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
];

// ============================================
// INSTALLATION
// ============================================

self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...", CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force immediate activation of new service worker
  self.skipWaiting();
});

// ============================================
// ACTIVATION
// ============================================

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...", CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name.startsWith("fluentfaster-") &&
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE
              );
            })
            .map((name) => {
              console.log("[SW] Removing old cache:", name);
              return caches.delete(name);
            })
        );
      }),
      // Take immediate control
      self.clients.claim(),
    ])
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_UPDATED",
              version: CACHE_VERSION,
            });
          });
        });
      })
  );
});

// ============================================
// REQUEST CACHING
// ============================================

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests for APIs (managed by offline queue)
  if (request.method !== "GET") {
    // For POST/PUT/PATCH/DELETE requests, let them pass normally
    // Offline queue handles them
    return;
  }

  // Ignore analytics and other external APIs
  if (
    url.hostname.includes("vercel.app") ||
    url.hostname.includes("google-analytics") ||
    url.hostname.includes("googletagmanager")
  ) {
    return;
  }

  // For navigation routes (Next.js pages), always let them pass to server
  // Next.js already has its own caching and routing system
  // Intercepting navigation causes 404 issues when app is reopened
  if (request.mode === "navigate") {
    // Don't intercept: let Next.js handle routing
    return;
  }

  // Ignore Next.js files (_next/static, _next/image, etc.)
  // Next.js already has its own caching and optimization
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Strategy: Network First for APIs, Cache First for static assets
  if (url.pathname.startsWith("/api/")) {
    // APIs: Network First with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (
    // Static assets: only for files with known extensions from /public folder
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i
    ) &&
    !url.pathname.startsWith("/_next/")
  ) {
    // Static assets: Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Other requests: let them pass normally (Next.js handles)
    return;
  }
});

/**
 * Network First Strategy - Try network first, fallback to cache
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);

    // If successful, cache the response
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Offline: try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Cache First Strategy - Try cache first, fallback to network
 * Used only for static assets (JS, CSS, images, etc.)
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    // Cache valid response (status 200-299)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // If fetching asset fails, return error
    // Don't try fallback to avoid 404 issues
    throw error;
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener("sync", (event) => {
  console.log("[SW] Background Sync triggered:", event.tag);

  if (event.tag === "sync-queue") {
    event.waitUntil(syncOfflineQueue());
  }
});

/**
 * Synchronize offline queue with exponential retry
 */
async function syncOfflineQueue() {
  try {
    console.log("[SW] Starting offline queue synchronization...");

    const items = await getQueueItems();

    if (items.length === 0) {
      console.log("[SW] No items in queue to sync");
      return;
    }

    console.log(`[SW] Syncing ${items.length} items...`);

    let synced = 0;
    let failed = 0;

    // Sort by priority and timestamp
    const sortedItems = items.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return a.timestamp - b.timestamp;
    });

    for (const item of sortedItems) {
      try {
        // Calculate exponential delay based on retries
        const delay = calculateExponentialBackoff(item.retries);

        if (delay > 0) {
          console.log(
            `[SW] Waiting ${delay}ms before trying item ${item.id} (retry ${item.retries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Try to send request
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            ...item.headers,
            "X-Idempotency-Key": item.idempotencyKey,
          },
          body: item.method !== "GET" ? item.body : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success: remove from queue
        await removeFromQueue(item.id);

        synced++;
        console.log(`[SW] ✅ Synced: ${item.url} (ID: ${item.id})`);
      } catch (error) {
        // Error: increment retries
        const newRetries = await incrementRetriesInSW(item.id);

        if (newRetries >= 5) {
          // Too many attempts: move to failed
          await moveToFailedInSW(item, error.message || "Sync error");

          failed++;
          console.error(
            `[SW] ❌ Failed after 5 attempts: ${item.url} (ID: ${item.id})`
          );
        } else {
          console.warn(
            `[SW] ⚠️ Error syncing (attempt ${newRetries}/5): ${item.url} (ID: ${item.id})`,
            error
          );

          // Reschedule sync if there are still attempts left
          if ("sync" in self.registration) {
            try {
              await self.registration.sync.register("sync-queue");
            } catch (syncError) {
              console.warn("[SW] Error rescheduling sync:", syncError);
            }
          }
        }
      }
    }

    console.log(
      `[SW] Sync complete: ${synced} synced, ${failed} failed`
    );

    // Notify clients about result
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        synced,
        failed,
        total: items.length,
      });
    });
  } catch (error) {
    console.error("[SW] Error syncing queue:", error);
  }
}

/**
 * Calculate exponential delay for retry
 * Returns delay in milliseconds
 */
function calculateExponentialBackoff(retries) {
  // Base: 1 second, max: 30 seconds
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, retries), maxDelay);

  // Add random jitter (0-30% of delay)
  const jitter = delay * 0.3 * Math.random();
  return Math.floor(delay + jitter);
}

// ============================================
// FALLBACK: Manual Sync (if Background Sync doesn't exist)
// ============================================

// Listen for messages from client for manual sync
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "SYNC_NOW") {
    // Manual sync requested by client
    event.waitUntil(syncOfflineQueue());
  }
});

// ============================================
// HELPER FUNCTIONS - IndexedDB
// ============================================

/**
 * Open connection to offline queue IndexedDB
 */
async function openQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_QUEUE_DB, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("queue")) {
        const queueStore = db.createObjectStore("queue", { keyPath: "id" });
        queueStore.createIndex("timestamp", "timestamp", { unique: false });
        queueStore.createIndex("priority", "priority", { unique: false });
      }

      if (!db.objectStoreNames.contains("failed")) {
        const failedStore = db.createObjectStore("failed", { keyPath: "id" });
        failedStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

/**
 * Get all items from queue
 */
async function getQueueItems() {
  try {
    const db = await openQueueDB();
    const transaction = db.transaction(["queue"], "readonly");
    const store = transaction.objectStore("queue");
    return await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Error getting queue items:", error);
    return [];
  }
}

/**
 * Remove item from queue
 */
async function removeFromQueue(id) {
  try {
    const db = await openQueueDB();
    const transaction = db.transaction(["queue"], "readwrite");
    const store = transaction.objectStore("queue");
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Error removing from queue:", error);
  }
}

/**
 * Increment retries for an item
 */
async function incrementRetriesInSW(id) {
  try {
    const db = await openQueueDB();
    const transaction = db.transaction(["queue"], "readwrite");
    const store = transaction.objectStore("queue");

    return await new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.retries = (item.retries || 0) + 1;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve(item.retries);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(0);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Error incrementing retries:", error);
    return 0;
  }
}

/**
 * Move item to failed queue
 */
async function moveToFailedInSW(item, error) {
  try {
    const db = await openQueueDB();
    const transaction = db.transaction(["queue", "failed"], "readwrite");
    const queueStore = transaction.objectStore("queue");
    const failedStore = transaction.objectStore("failed");

    await new Promise((resolve, reject) => {
      // Remove from main queue
      const deleteRequest = queueStore.delete(item.id);
      deleteRequest.onsuccess = () => {
        // Add to failed queue
        const addRequest = failedStore.add({
          ...item,
          error,
          failedAt: Date.now(),
        });
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  } catch (error) {
    console.error("[SW] Error moving to failed:", error);
  }
}
