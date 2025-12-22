import secureLocalStorage from "react-secure-storage";

export const getLocalStorageItem = (
  key: string,
  isObject: boolean = false
): string | object | null => {
  try {
    // console.log("Retrieving item from localStorage:", key);
    const encryptedData = secureLocalStorage.getItem(key) as string;
    // console.log("Encrypted data retrieved:", encryptedData);
    if (!encryptedData) return null;

    return isObject ? JSON.parse(encryptedData) : encryptedData;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};