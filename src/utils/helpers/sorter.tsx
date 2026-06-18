// sorter.ts
import { MdSortByAlpha } from "react-icons/md";
import {
  ImSortAlphaAsc,
  ImSortAlphaDesc,
  ImSortNumericAsc,
  ImSortNumbericDesc,
} from "react-icons/im";
import { TbSort09 } from "react-icons/tb";

// Safely read nested values like: "user.name.first"
const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

// ---- TYPE ----
export type SortType = "alpha" | "date" | "number" | "phone";

// ---- MAIN EXPORT ----
export const getSorterConfig = (
  dataIndex: string,
  sortType: SortType = "alpha"
) => ({
  sorter: (a: any, b: any) => {
    const aVal = getNestedValue(a, dataIndex);
    const bVal = getNestedValue(b, dataIndex);

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (sortType === "date") {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return aTime - bTime;
    }

    if (sortType === "number" || sortType === "phone") {
      return Number(aVal) - Number(bVal);
    }

    return String(aVal).localeCompare(String(bVal));
  },

  showSorterTooltip: false,

  // ---- ICONS: Alpha vs Numeric ----
  sortIcon: ({ sortOrder }: { sortOrder?: "ascend" | "descend" | null }) => {
    if (sortType === "number" || sortType === "phone") {
      if (sortOrder === "ascend")
        return <ImSortNumericAsc className="text-gray-600" />;
      if (sortOrder === "descend")
        return <ImSortNumbericDesc className="text-gray-600" />;
      return <TbSort09 className="text-gray-600" />;
    }

    if (sortOrder === "ascend")
      return <ImSortAlphaAsc className="text-gray-600" />;
    if (sortOrder === "descend")
      return <ImSortAlphaDesc className="text-gray-600" />;
    return <MdSortByAlpha className="text-gray-600" />;
  },
});
