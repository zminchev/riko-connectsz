import "src/styles/globals.css";
import type { AppProps } from "next/app";
import NotificationManager from "src/components/NotificationManager";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NotificationManager />
      <Component {...pageProps} />
    </>
  );
}
