import Cookies from "js-cookie";
import { getLocalStorageItem } from "../utils/localStorageHelper";

export const prepareHeadersWithToken = (headers: Headers) => {
  const token = Cookies.get("token");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  headers.set("ngrok-skip-browser-warning", "true");
  return headers;
};

const getMutationBody = (body: any) => {
  const storedData = getLocalStorageItem("sessionData", true) as any;

  const getValid = (value: any, fallback: any) =>
    value !== undefined && value !== null && value !== 0 ? value : fallback;

  const requestBody: any = {
    ...body,
    shop_id: getValid(body?.shop_id, storedData?.shop?.id),
    user_id: getValid(body?.user_id, storedData?.user?.id),
  };

  if (body instanceof FormData) {
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        body.append(key, String(value));
      }
    });
    return body;
  }

  return requestBody;
};

export const postMutation = (url: string) => (body: any) => {
  return {
    url,
    method: "POST",
    body: getMutationBody(body),
  };
};

export const getMutation = (url: string, params?: Record<string, any>) => ({
    url,
    method: "GET",
    params: params,
});

export const createMutation = (url: string) => (body: any) => {
  return {
    url,
    method: "POST",
    body: getMutationBody(body),
  };
};

export const deleteMutation = (url: string) => (body: any) => {
  return {
    url,
    method: "DELETE",
    body: getMutationBody(body),
  };
};

export const patchMutation = (url: string, body: any) => {
  return {
    url,
    method: "PATCH",
    body: getMutationBody(body),
  };
};

export const putMutation = (url: string, body: any) => {
  return {
    url,
    method: "PUT",
    body: getMutationBody(body),
  };
};