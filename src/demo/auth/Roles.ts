import { Roles_Auth } from "./authEntities";
import { Roles_S2Files } from "$modules/s2files/Roles_S2Files";

/** ALL ROLES of your application. [Learn more](https://remult.dev/docs/modules#roles) */
export const Roles = {
  Admin: "admin",
  ...Roles_Auth,
  ...Roles_S2Files,
} as const;
