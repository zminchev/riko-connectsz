import "src/styles/globals.css";
import type { AppProps } from "next/app";
import NotificationManager from "src/components/NotificationManager";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NotificationManager />
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
