"use client";

import {
	AlertTriangle,
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	RefreshCw,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	errorId: string;
	componentStack: string;
	timestamp: Date;
	route: string;
	userAgent: string;
	url: string;
	expanded: boolean;
	copied: boolean;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: "",
			componentStack: "",
			timestamp: new Date(),
			route: "",
			userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
			url: typeof window !== "undefined" ? window.location.href : "",
			expanded: false,
			copied: false,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return {
			hasError: true,
			error,
			errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date(),
			route: typeof window !== "undefined" ? window.location.pathname : "",
			url: typeof window !== "undefined" ? window.location.href : "",
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Ensure we have a valid Error object from the start
		const safeError =
			error instanceof Error
				? error
				: new Error(String(error || "Unknown error"));

		// Ignore Service Worker related errors
		const errorMessage = safeError.message || "";
		const errorStack = safeError.stack || "";

		if (
			errorMessage.includes("ServiceWorker") ||
			errorMessage.includes("service worker") ||
			errorMessage.includes("SW_UPDATED") ||
			errorStack.includes("sw.js") ||
			errorStack.includes("ServiceWorker")
		) {
			// During SW update, just log and don't show error screen
			console.log(
				"ℹ️ Service Worker related error (ignored):",
				safeError.message,
			);
			return;
		}

		// Full error logging - serialize safely
		try {
			const errorDetails = {
				error: {
					name: safeError.name || "Unknown",
					message: safeError.message || "Unknown error",
					stack: safeError.stack || "Stack trace not available",
				},
				componentStack:
					errorInfo?.componentStack || "Component stack not available",
				timestamp: new Date().toISOString(),
				route: typeof window !== "undefined" ? window.location.pathname : "",
				url: typeof window !== "undefined" ? window.location.href : "",
				userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
			};

			console.error("🚨 Error Boundary caught an error:", errorDetails);
		} catch (_serializationError) {
			// If serialization fails, log in a simpler way
			console.error("🚨 Error Boundary caught an error (non-serializable):", {
				errorMessage: safeError.message || "Unknown error",
				errorName: safeError.name || "Error",
				timestamp: new Date().toISOString(),
			});
		}

		// Update state with full information
		this.setState({
			error: safeError,
			errorInfo,
			componentStack: errorInfo?.componentStack || "",
		});

		// Send to logging service (optional)
		if (process.env.NODE_ENV === "production") {
			// Here you can send to Sentry, LogRocket, etc.
			// sendErrorToLoggingService(errorDetails);
		}
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: "",
			componentStack: "",
			timestamp: new Date(),
			route: "",
			expanded: false,
			copied: false,
		});
	};

	handleReload = () => {
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	handleCopy = async () => {
		const errorReport = this.generateErrorReport();
		try {
			await navigator.clipboard.writeText(errorReport);
			this.setState({ copied: true });
			setTimeout(() => this.setState({ copied: false }), 2000);
		} catch (err) {
			console.error("Error copying:", err);
		}
	};

	generateErrorReport = (): string => {
		const {
			error,
			errorInfo,
			errorId,
			timestamp,
			route,
			url,
			userAgent,
			componentStack,
		} = this.state;

		return `
═══════════════════════════════════════════════════════════
🚨 ERROR REPORT - FluentFaster
═══════════════════════════════════════════════════════════

Error ID: ${errorId}
Timestamp: ${timestamp.toISOString()}
Local Date/Time: ${timestamp.toLocaleString("en-US")}

═══════════════════════════════════════════════════════════
📋 ERROR INFORMATION
═══════════════════════════════════════════════════════════

Name: ${error?.name || "N/A"}
Message: ${error?.message || "N/A"}

Stack Trace:
${error?.stack || "N/A"}

═══════════════════════════════════════════════════════════
🔍 CONTEXT
═══════════════════════════════════════════════════════════

Route: ${route || "N/A"}
Full URL: ${url || "N/A"}
User Agent: ${userAgent || "N/A"}

Component Stack:
${componentStack || "N/A"}

═══════════════════════════════════════════════════════════
💻 ENVIRONMENT INFORMATION
═══════════════════════════════════════════════════════════

Environment: ${process.env.NODE_ENV || "development"}
Platform: ${typeof window !== "undefined" ? "Browser" : "Server"}

═══════════════════════════════════════════════════════════
    `.trim();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { error, errorId, timestamp, route, url, expanded, copied } =
				this.state;

			return (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className={cn(
							"w-full max-w-4xl rounded-3xl bg-background/95 backdrop-blur-3xl",
							"border border-border shadow-[0_20px_60px_0_rgba(0,0,0,0.5)]",
							"max-h-[90vh] flex flex-col overflow-hidden",
						)}
					>
						{/* Header */}
						<div className="flex items-center gap-4 border-b border-border p-6">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
								<AlertTriangle className="h-6 w-6 text-red-400" />
							</div>
							<div className="flex-1">
								<h1 className="text-2xl font-bold text-foreground">
									Unexpected Error
								</h1>
								<p className="text-sm text-muted-foreground">ID: {errorId}</p>
							</div>
							<button
								onClick={this.handleReset}
								className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 space-y-4">
							{/* Basic Information */}
							<div className="rounded-xl bg-muted/50 p-4 border border-border">
								<h2 className="text-sm font-semibold text-foreground/80 mb-3">
									Basic Information
								</h2>
								<div className="space-y-2 text-sm">
									<div className="flex items-start gap-2">
										<span className="text-muted-foreground min-w-[100px]">
											Date/Time:
										</span>
										<span className="text-foreground">
											{timestamp.toLocaleString("en-US", {
												dateStyle: "full",
												timeStyle: "long",
											})}
										</span>
									</div>
									<div className="flex items-start gap-2">
										<span className="text-muted-foreground min-w-[100px]">
											Route:
										</span>
										<span className="text-foreground font-mono text-xs break-all">
											{route || "/"}
										</span>
									</div>
									<div className="flex items-start gap-2">
										<span className="text-muted-foreground min-w-[100px]">
											URL:
										</span>
										<span className="text-foreground font-mono text-xs break-all">
											{url}
										</span>
									</div>
								</div>
							</div>

							{/* Error Message */}
							<div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20">
								<h2 className="text-sm font-semibold text-red-400 mb-2">
									Error Message
								</h2>
								<p className="text-foreground font-mono text-sm">
									{error?.message || "Unknown error"}
								</p>
							</div>

							{/* Stack Trace (Expandable) */}
							<div className="rounded-xl bg-muted/50 p-4 border border-border">
								<button
									onClick={() => this.setState({ expanded: !expanded })}
									className="flex w-full items-center justify-between text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
								>
									<span>Stack Trace</span>
									{expanded ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</button>
								<AnimatePresence>
									{expanded && (
										<motion.pre
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="mt-3 overflow-auto rounded-lg bg-black/30 p-3 text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all"
										>
											{error?.stack || "Stack trace not available"}
										</motion.pre>
									)}
								</AnimatePresence>
							</div>

							{/* Component Stack (Expandable) */}
							{this.state.componentStack && (
								<div className="rounded-xl bg-muted/50 p-4 border border-border">
									<button
										onClick={() =>
											this.setState({ expanded: !this.state.expanded })
										}
										className="flex w-full items-center justify-between text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
									>
										<span>Component Stack</span>
										{expanded ? (
											<ChevronUp className="h-4 w-4" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</button>
									<AnimatePresence>
										{expanded && (
											<motion.pre
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												className="mt-3 overflow-auto rounded-lg bg-black/30 p-3 text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all"
											>
												{this.state.componentStack}
											</motion.pre>
										)}
									</AnimatePresence>
								</div>
							)}

							{/* User Agent */}
							<div className="rounded-xl bg-muted/50 p-4 border border-border">
								<h2 className="text-sm font-semibold text-foreground/80 mb-2">
									User Agent
								</h2>
								<p className="text-muted-foreground font-mono text-xs break-all">
									{this.state.userAgent}
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 border-t border-border p-6">
							<button
								onClick={this.handleCopy}
								className={cn(
									"flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
									copied
										? "bg-green-500/20 text-green-400 border border-green-500/30"
										: "bg-muted text-foreground hover:bg-muted/80 border border-border",
								)}
							>
								{copied ? (
									<>
										<Check className="h-4 w-4" />
										Copied!
									</>
								) : (
									<Copy className="h-4 w-4" />
								)}
							</button>
							<button
								onClick={this.handleReset}
								className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 transition-all border border-primary/30"
							>
								Try Again
							</button>
							<button
								onClick={this.handleReload}
								className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
							>
								<RefreshCw className="h-4 w-4" />
							</button>
						</div>
					</motion.div>
				</div>
			);
		}

		return this.props.children;
	}
}
