import { useMemo } from "react";

/**
 * Custom hook to detect the current platform (Windows, Mac, Linux).
 * Defaults to 'linux' if electronAPI is not available.
 */
export const usePlatform = () => {
  return useMemo(() => {
    const platform = window.electronAPI?.platform || "linux";
    return {
      platform,
      isMac: platform === "darwin",
      isWindows: platform === "win32",
      isLinux: platform === "linux",
    };
  }, []);
};
