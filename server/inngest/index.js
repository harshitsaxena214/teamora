import { Inngest } from "inngest";
import prisma from "../lib/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "teamora" });

const syncUserFunction = inngest.createFunction(
    {id: "sync-user-from-clerk"},
    {evemt: "clerk/user.created"},
    async ({ event, step }) => {
        const { data } = event
        await prisma.user.create({  data:{
            id:data.id,
            email:data.email_addresses[0].email_address,
        }  })}
)

// Create an empty array where we'll export future Inngest functions
export const functions = [];