import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const formattedDate = (date: any) =>
  dayjs(date).format("DD/MM/YYYY [At] hh:mm A");

export const formattedDateOnly = (date: any) =>
  dayjs(date).format("DD/MM/YYYY");

export const formattedMonthYear = (date: any) =>
  date ? dayjs(date).format("MMM YYYY") : "";

export const formattedTime = (date: any) =>
  dayjs(date).format("hh:mm A");

export const getCreatedTimeAgo = (date: any, text?: string) =>
  date ? `${text ?? "Created"} ${dayjs(date).fromNow()}` : "";

export const getRelativeTime = (unixTimestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(unixTimestamp - now);

  if (diff < 60) return `${diff} seconds`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days`;
  return `${Math.floor(diff / 604800)} weeks`;
};
