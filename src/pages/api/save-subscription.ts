import { NextApiRequest, NextApiResponse } from "next";
import webPush from "web-push";
import createClient from "src/utils/supabase/api";

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};

webPush.setVapidDetails(
  "mailto:jivkominchev.j@gmail.com", // Your email for VAPID
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);

  if (req.method === "POST") {
    const { userId, message } = req.body;

    // Get the user's push subscription from Supabase
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return res.status(500).json({ error: "Error fetching subscriptions" });
    }

    if (subscriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "No subscriptions found for this user" });
    }

    // Send a push notification to each subscription
    const notificationPayload = {
      title: "New Message",
      body: message,
    };

    const notificationPromises = subscriptions.map((sub) =>
      webPush.sendNotification(
        sub.subscription,
        JSON.stringify(notificationPayload)
      )
    );

    Promise.all(notificationPromises)
      .then(() =>
        res.status(200).json({ message: "Notifications sent successfully" })
      )
      .catch((err) => {
        console.error("Error sending notifications:", err);
        res.status(500).json({ error: "Error sending notifications" });
      });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
