//Get all workspaces of user
import prisma from "../lib/prisma.js";

export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    console.log("API userId:", userId); 
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });
    res.json({ workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//Add Members to Workspace

export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!workspaceId || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid Role" });
    }

    //fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });
    }

    //Check whether creator is admin or not
    if (
      (!workspace.members,
      find((member) => member.userId === userId && member.role === "ADMIN"))
    ) {
      return res
        .status(401)
        .json({ success: false, message: "You don't have Admin priviledges" });
    }

    //Check if user is already a member
    const existingMember = workspace.members.find(
      (member) => member.userId === userId
    );
    if (existingMember) {
      return res
        .status(400)
        .json({ success: false, message: "User is already a member" });
    }
    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    return res.json({ member, message: "Member added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
