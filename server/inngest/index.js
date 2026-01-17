import { Inngest } from "inngest";
import prisma from "../lib/prisma.js"; // <--- Import the instance directly

// Create a client to send and receive events
export const inngest = new Inngest({ id: "teamora" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("create-user", async () => {
      return prisma.user.create({
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

//Inngest functions to save workspace data to the database

const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("create-workspace", async () => {
      return prisma.workspace.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          ownerId: data.created_by,
          image_url: data.image_url,
        },
      });
    });
    // Add creator as ADMIN member of the workspace
    await step.run("add-admin-member", async () => {
      return prisma.workspaceMember.create({
        data: {
          userId: data.created_by,
          workspaceId: data.id,
          role: "ADMIN",
        },
      });
    });
  }
);

//Inngest functions to update workspace data to the database

const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("update-workspace", async () => {
      return prisma.workspace.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: data.slug,
          image_url: data.image_url,
        },
      });
    });
  }
);

//Inngest functions to delete workspace data from the database

const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspce-from-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("delete-workspace", async () => {
      return prisma.workspace.delete({
        where: { id: data.id },
      });
    });
  }
);

//Inngest function to save workspace member data to the database

const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("create-workspace-member", async () => {
      return prisma.workspaceMember.create({
        data: {
          userId: data.user_id,
          workspaceId: data.organization_id,
          role: String(data.role_name).toUpperCase(),
        },
      });
    });
  }
);

// Export all functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, syncWorkspaceCreation, syncWorkspaceUpdation, syncWorkspaceDeletion, syncWorkspaceMemberCreation];
