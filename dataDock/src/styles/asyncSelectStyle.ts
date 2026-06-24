import type { StylesConfig } from "react-select";

export const asyncSelectStyles: StylesConfig<any, false> = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "5px",
    fontSize: "18px",
    fontWeight: 600,
    borderColor: state.isFocused ? "#3b82f6" : "#0f0f0f",
    borderWidth: "1px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),

  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};
// const asyncSelectStyles = {
//   control: (base: any, state: any) => ({
//     ...base,
//     minHeight: "48px",
//     fontSize: "16px",
//     fontWeight: 600,
//     borderWidth: "15px",
//     boxShadow: "none",
//     color: "#2e2ebe",
//   }),
//   singleValue: (provided: any) => ({
//     ...provided,
//     color: "#0d0e0e",
//     fontWeight: 600,
//   }),
//   input: (provided: any) => ({
//     ...provided,
//     color: "#1e3a8a",
//     fontWeight: 600,
//   }),
//   option: (provided: any) => ({
//     ...provided,
//     fontWeight: 600,
//   }),
// };
