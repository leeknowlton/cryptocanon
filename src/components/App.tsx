"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { HomeTab } from "~/components/ui/tabs";
import { X } from "lucide-react";

// --- Types ---
export enum Tab {
  Home = "home",
  Actions = "actions",
  Context = "context",
  Wallet = "wallet",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 * 
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 * 
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App() {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    added,
    actions,
  } = useMiniApp();

  // --- State ---
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [isAddingMiniApp, setIsAddingMiniApp] = useState(false);

  // --- Effects ---
  /**
   * Sets the initial tab to "home" when the SDK is loaded.
   *
   * This effect ensures that users start on the home tab when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Home);
    }
  }, [isSDKLoaded, setInitialTab]);

  /**
   * Prompts the user to add the mini app if they haven't already.
   *
   * This effect checks if the mini app has been added and if the user
   * has previously dismissed the prompt. If not, it shows the prompt immediately.
   */
  useEffect(() => {
    if (isSDKLoaded && !added) {
      const hasSeenPrompt = localStorage.getItem('hasSeenAddPrompt');
      if (!hasSeenPrompt) {
        setShowAddPrompt(true);
      }
    }
  }, [isSDKLoaded, added]);

  // --- Handlers ---
  /**
   * Handles adding the mini app to the user's client.
   *
   * Calls the addMiniApp action and stores notification details if provided.
   * On success or dismissal, marks the prompt as seen in localStorage.
   */
  const handleAddMiniApp = async () => {
    if (!isSDKLoaded || !actions.addMiniApp) return;

    setIsAddingMiniApp(true);
    try {
      const result = await actions.addMiniApp();
      if (result?.notificationDetails) {
        console.log('Mini app added with notifications enabled');
      }
      setShowAddPrompt(false);
      localStorage.setItem('hasSeenAddPrompt', 'true');
    } catch (error) {
      console.error('Failed to add mini app:', error);
    } finally {
      setIsAddingMiniApp(false);
    }
  };

  /**
   * Dismisses the add mini app prompt.
   *
   * Hides the prompt and marks it as seen so it won't show again.
   */
  const handleDismissPrompt = () => {
    setShowAddPrompt(false);
    localStorage.setItem('hasSeenAddPrompt', 'true');
  };

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p>Loading SDK...</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Add Mini App Prompt */}
      {showAddPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 shadow-2xl">
            <button
              onClick={handleDismissPrompt}
              className="absolute right-4 top-4 rounded-lg p-1 text-base-content/60 hover:bg-base-200 hover:text-base-content"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-base-content mb-2">
                Add to Your Mini Apps
              </h2>
              <p className="text-base-content/70">
                Save the Bitcoin White Paper to your mini apps for quick access anytime.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddMiniApp}
                disabled={isAddingMiniApp}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-content hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingMiniApp ? 'Adding...' : 'Add Mini App'}
              </button>
              <button
                onClick={handleDismissPrompt}
                className="w-full rounded-lg border border-base-300 bg-base-200 px-4 py-3 font-semibold text-base-content hover:bg-base-300"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header should be full width */}
      {/* <Header neynarUser={neynarUser} /> */}

      {/* Main content and footer should be centered */}
      <div className="container py-2 pb-20">
        {/* Tab content rendering */}
        <HomeTab />
        {/* {currentTab === Tab.Home && <HomeTab />}
        {currentTab === Tab.Actions && <ActionsTab />}
        {currentTab === Tab.Context && <ContextTab />}
        {currentTab === Tab.Wallet && <WalletTab />} */}

        {/* Footer with navigation */}
        {/* <Footer activeTab={currentTab as Tab} setActiveTab={setActiveTab} showWallet={USE_WALLET} /> */}
      </div>
    </div>
  );
}

