import { remultApi } from "remult/remult-sveltekit";
import { SqlDatabase } from "remult";
import { createClient } from "@libsql/client";
import { TursoDataProvider } from "remult/remult-turso";

import { auth } from "../demo/auth/server/index";
import { env } from "$env/dynamic/private";

export const api = remultApi({
  dataProvider: new SqlDatabase(
    new TursoDataProvider(
      createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      }),
    ),
  ),
  admin: env.RUNTIME_ENV === "development",
  modules: [
    auth({
      // Add some roles to some users with env variable.
      // SUPER_ADMIN_EMAILS
    }),
  ],
});
