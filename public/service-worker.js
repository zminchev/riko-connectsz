self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
  
    const title = data.title || 'New Message';
    const options = {
      body: JSON.stringify(data.body) || 'You have a new message!',
    //   icon: '/icons/icon-192x192.png', // Optional: Set your custom icon
    //   badge: '/icons/badge-72x72.png', // Optional: Set a badge icon for notifications
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  