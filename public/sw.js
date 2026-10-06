self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload;

  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const title =
    typeof payload.title === "string" &&
    payload.title.trim()
      ? payload.title
      : "Nexa";

  const body =
    typeof payload.body === "string" &&
    payload.body.trim()
      ? payload.body
      : "Nouvelle notification";

  const internalData =
    payload.data &&
    typeof payload.data === "object"
      ? payload.data
      : {};

  const options = {
    body,
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    data: internalData,
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const notificationData =
      event.notification.data || {};

    const orderId =
      typeof notificationData.orderId === "string"
        ? notificationData.orderId
        : typeof notificationData.order_id === "string"
          ? notificationData.order_id
          : null;

    const targetUrl = orderId
      ? `/dashboard/leaderboard/orders/${orderId}`
      : "/dashboard";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          const existingClient = clientList.find(
            (client) =>
              client.url.includes("/dashboard")
          );

          if (existingClient) {
            return existingClient
              .focus()
              .then(() => {
                if (
                  "navigate" in existingClient
                ) {
                  return existingClient.navigate(
                    targetUrl
                  );
                }

                return undefined;
              });
          }

          return clients.openWindow(targetUrl);
        })
    );
  }
);