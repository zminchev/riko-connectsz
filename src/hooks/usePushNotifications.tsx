import { useRef, useEffect, useState } from "react";
import { Message } from "src/types/Message.types";

let lastNotificationTime = 0;
const THROTTLE_INTERVAL = 5000;

const usePushNotifications = (
  firstName?: string,
  lastName?: string,
  groupName?: string
) => {
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const [canPlaySound, setCanPlaySound] = useState<boolean>(false);
  const [pendingSound, setPendingSound] = useState<boolean>(false);

  const subscribeToPushNotifications = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Check if the user is already subscribed
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // If not subscribed, subscribe the user
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // Make sure this is set
            ),
          });

          // Send the new subscription to your backend for saving
          await fetch("/api/save-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ subscription: newSubscription }),
          });
        }
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: any) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  const sendPushNotification = async (message: Message) => {
    const currentTime = Date.now();

    if (currentTime - lastNotificationTime < THROTTLE_INTERVAL) {
      return;
    }

    lastNotificationTime = currentTime;

    if ("serviceWorker" in navigator && "PushManager" in window) {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("No push subscription found.");
        return;
      }

      // Prepare the payload with the message details

      const messageFrom =
        firstName && lastName
          ? `You have a new message from ${firstName} ${lastName}`
          : `New message in ${groupName}`;
      const payload = {
        title: messageFrom,
        body: message.content,
        tag: message.chat_id,
      };

      // Send the notification to your backend API to trigger the push
      await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription, // Push subscription object
          message: payload, // Message payload
        }),
      });

      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch((error) => {
          console.warn("Notification sound playback failed:", error);
        });
      }
    }
  };

  // Play the queued sound when the user interacts
  useEffect(() => {
    if (canPlaySound && pendingSound) {
      notificationSoundRef.current?.play().catch((error) => {
        console.warn("Sound play prevented:", error);
      });
      setPendingSound(false); // Clear the pending sound after playing
    }
  }, [canPlaySound, pendingSound]);

  // Track user interaction to allow sound playback
  useEffect(() => {
    subscribeToPushNotifications();

    const enableSound = () => setCanPlaySound(true);

    document.addEventListener("click", enableSound);
    document.addEventListener("keydown", enableSound);

    return () => {
      document.removeEventListener("click", enableSound);
      document.removeEventListener("keydown", enableSound);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sendPushNotification, notificationSoundRef };
};

export default usePushNotifications;
