export const lightTheme = {
  name: "light",
  colors: {
    background: "#ffffff",
    text: "#000000",
    primary: "#007bff",
  },
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
};

export const darkTheme = {
  name: "dark",
  colors: {
    background: "#1e1e1e",
    text: "#ffffff",
    primary: "#1e90ff",
  },
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
};

export type ThemeType = typeof lightTheme;