// Entry point for Express Server
import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextHandler, nextApp } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({
  req, 
  res
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res
});

export type ExpressContext = Awaited<ReturnType<typeof createContext>>

const start = async () => {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  // TRPC Middleware
  app.use("/api/trpc", trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }));

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started...");

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js APP URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};

start();
