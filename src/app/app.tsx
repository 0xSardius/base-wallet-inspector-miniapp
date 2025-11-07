"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";

// note: dynamic import is required for components that use the Frame SDK
const WalletInspector = dynamic(() => import("~/components/WalletInspector"), {
  ssr: false,
});

export default function App() {
  return <WalletInspector />;
}
