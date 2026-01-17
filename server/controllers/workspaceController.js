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
    
    console.log(`Found ${workspaces.length} workspaces for user ${userId}`);
    res.json({ workspaces });
  } catch (error) {
    console.log("Error in getUserWorkspaces:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add Members to Workspace
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

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });
    }

    // FIXED: Check whether requester is admin or not
    const isAdmin = workspace.members.find(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "You don't have Admin privileges" });
    }

    // FIXED: Check if the NEW user is already a member (not the requester)
    const existingMember = workspace.members.find(
      (member) => member.userId === user.id
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
      },
      include: {
        user: true,
      },
    });

    return res.json({ 
      success: true,
      member, 
      message: "Member added successfully" 
    });
  } catch (error) {
    console.log("Error in addMember:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};