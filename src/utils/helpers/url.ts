import { FILE_URL } from "./env";

export const removeFileUrl = (url: string) =>
  url?.replace(FILE_URL, "") || "";

export const addFileUrl = (path: string) =>
  !path ? "" : path.startsWith("http") ? path : `${FILE_URL}${path}`;

export const hasFileUrl = (url: string) =>
  url?.startsWith(FILE_URL);

