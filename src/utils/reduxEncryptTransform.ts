// src/utils/reduxEncryptTransform.ts
import { Transform } from "redux-persist";

export const reduxEncryptTransform: Transform<any, any> = {
  in: (state) => state, // state before saving
  out: (state) => state, // state after restoring
};
