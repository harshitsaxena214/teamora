import { Inngest } from "inngest";
import prisma from "../lib/prisma.js"; // <--- Import the instance directly

// Create a client to send and receive events
export const inngest = new Inngest({ id: "teamora" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    // REMOVED: const prisma = getPrisma();
    const { data } = event;

    await step.run("create-user", async () => {
      return prisma.user.create({ // <--- Use the imported 'prisma' directly
        data: {
          id: data.id,
          email: data?.email_addresses?.[0]?.email_address,
          name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
          image: data?.image_url,
        },
      });
    });

    return { ok: true }; 
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { data } = event;

    await step.run("delete-user", async () => {
      return prisma.user.delete({
        where: { id: data.id },
      });
    });

    return { ok: true };
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { data } = event;

    await step.run("update-user", async () => {
      return prisma.user.update({
        where: { id: data.id },
        data: {
          email: data?.email_addresses?.[0]?.email_address,
          name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
          image: data?.image_url,
        },
      });
    });

    return { ok: true }; 
  }
);

// Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];