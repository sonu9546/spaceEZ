// theme/antdTheme.ts
import { theme } from "antd"

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#22A652",
    fontFamily: "var(--font-plus-jakarta-sans), var(--font-inter), sans-serif",
    borderRadius: 12,
    fontSize: 14,
    colorText: "#1F2937",
    colorTextDescription: "#6B7280",
    colorBgLayout: "#F8F6F0",
    colorBgContainer: "#FFFFFF",
    colorBorder: "#E5EAF2",
    controlHeight: 42,
  },
  components: {
    Button: {
      borderRadius: 8,
      colorPrimary: "#22A652",
      colorPrimaryHover: "#1d8e45",
      colorTextLightSolid: "#ffffff",
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    }
  },
}

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#22A652",
    fontFamily: "var(--font-plus-jakarta-sans), var(--font-inter), sans-serif",
    borderRadius: 12,
    fontSize: 14,
    colorText: "#f3f4f6",
    colorTextDescription: "#9ca3af",
    colorBgLayout: "#0d121f",
    colorBgContainer: "#141b2d",
    colorBorder: "#232d42",
    controlHeight: 42,
  },
  components: {
    Button: {
      borderRadius: 8,
      colorPrimary: "#22A652",
      colorPrimaryHover: "#1d8e45",
      colorTextLightSolid: "#ffffff",
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    }
  },
}
