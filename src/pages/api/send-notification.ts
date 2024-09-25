import { NextApiRequest, NextApiResponse } from 'next';
import webPush from 'web-push';

// Set up VAPID keys (replace with your actual keys)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

webPush.setVapidDetails(
  'mailto:jivkominchev.j@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { subscription, message } = req.body;
  
      // Ensure subscription and message are present
      if (!subscription || !message) {
        return res.status(400).json({ error: 'Subscription or message is missing' });
      }
      console.log(message, "MESSAGE FROM API");
      
  
      // Payload for the push notification
      const payload = JSON.stringify({
        title: message.title || 'New Notification',
        body: message.body || 'You have a new notification',
      });
  
      try {
        // Send the notification
        await webPush.sendNotification(subscription, payload);
        return res.status(200).json({ message: 'Notification sent successfully' });
      } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
      }
    } else {
      // Allow only POST requests
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }