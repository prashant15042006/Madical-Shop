import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let permissionPromise: Promise<boolean> | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (permissionPromise) return permissionPromise;

  permissionPromise = (async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted) return true;
      if (
        settings.canAskAgain ||
        settings.status === Notifications.PermissionStatus.UNDETERMINED
      ) {
        const req = await Notifications.requestPermissionsAsync();
        return req.granted;
      }
      return false;
    } catch {
      return false;
    }
  })();
  return permissionPromise;
}

export async function notify(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const ok = await ensureNotificationPermission();
    if (!ok) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: null, // fire immediately
    });
  } catch {
    // ignore
  }
}
