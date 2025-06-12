// This ensures TypeScript knows about the TradingView global object
// once the script is loaded.

declare global {
  interface Window {
    TradingView: any; // You can refine this type if you have more details
  }
  const TradingView: any; // For direct usage without window prefix
}

// Export {} to make this a module file if it's not already.
// This is not strictly necessary if you don't have other global types causing issues.
export {};
