import "src/styles/globals.css";
import type { AppProps } from "next/app";
import NotificationManager from "src/components/NotificationManager";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ModalProvider } from "src/context/ModalContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NotificationManager />
      <ModalProvider>
        <Component {...pageProps} />
      </ModalProvider>
      <SpeedInsights />
    </>
  );
}
