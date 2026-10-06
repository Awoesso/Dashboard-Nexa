export const registerServiceWorker = async (): Promise<
  ServiceWorkerRegistration | null
> => {
  if (!("serviceWorker" in navigator)) {
    console.warn(
      "Les Service Workers ne sont pas supportés par ce navigateur."
    );

    return null;
  }

  try {
    const existingRegistration =
      await navigator.serviceWorker.getRegistration(
        "/"
      );

    if (existingRegistration) {
      return existingRegistration;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/sw.js",
        {
          scope: "/",
        }
      );

    console.log(
      "Service Worker enregistré :",
      registration.scope
    );

    return registration;
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement du Service Worker :",
      error
    );

    return null;
  }
};