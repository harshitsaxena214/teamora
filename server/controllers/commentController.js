import prisma from "../lib/prisma.js";

export const addComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, taskId } = req.body;
    // check if user is project member

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find((member) => member.userId === userId);

    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        taskId,
      },
      include: { user: true },
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message || error.code });
  }
};

// Get Comments for a Task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
    });
    return res.json({comments})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message || error.code });
  }
};
