import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api";

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
};

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ getToken }) => {
    try {
      const { data } = await api.get("/api/workspaces", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      return data.workspaces || [];
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
    }
  },
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action) => {
      localStorage.setItem("currentWorkspaceId", action.payload);
      state.currentWorkspace = state.workspaces.find(
        (w) => w.id === action.payload,
      );
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);

      // set current workspace to the new workspace
      if (state.currentWorkspace?.id !== action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    updateWorkspace: (state, action) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id ? action.payload : w,
      );

      // if current workspace is updated, set it to the updated workspace
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(
        (w) => w._id !== action.payload,
      );
    },
    addProject: (state, action) => {
      // Only update in the workspaces array
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace?.id
          ? { ...w, projects: [...w.projects, action.payload] }
          : w,
      );

      // Update currentWorkspace reference
      if (state.currentWorkspace) {
        state.currentWorkspace = state.workspaces.find(
          (w) => w.id === state.currentWorkspace.id,
        );
      }
    },
    addTask: (state, action) => {
      // Only update in the workspaces array
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace?.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? { ...p, tasks: [...p.tasks, action.payload] }
                  : p,
              ),
            }
          : w,
      );

      // Update currentWorkspace reference
      if (state.currentWorkspace) {
        state.currentWorkspace = state.workspaces.find(
          (w) => w.id === state.currentWorkspace.id,
        );
      }
    },
    updateTask: (state, action) => {
      // Only update in the workspaces array
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace?.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t,
                      ),
                    }
                  : p,
              ),
            }
          : w,
      );

      // Update currentWorkspace reference
      if (state.currentWorkspace) {
        state.currentWorkspace = state.workspaces.find(
          (w) => w.id === state.currentWorkspace.id,
        );
      }
    },
    deleteTask: (state, action) => {
      // Only update in the workspaces array
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace?.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? {
                      ...p,
                      tasks: p.tasks.filter(
                        (t) => !action.payload.taskIds.includes(t.id),
                      ),
                    }
                  : p,
              ),
            }
          : w,
      );

      // Update currentWorkspace reference
      if (state.currentWorkspace) {
        state.currentWorkspace = state.workspaces.find(
          (w) => w.id === state.currentWorkspace.id,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.workspaces = action.payload;
      if (action.payload.length > 0) {
        const localStorageCurrentWorkspaceId =
          localStorage.getItem("currentWorkspaceId");
        if (localStorageCurrentWorkspaceId) {
          const findWorkspace = action.payload.find(
            (w) => w.id === localStorageCurrentWorkspaceId,
          );
          if (findWorkspace) {
            state.currentWorkspace = findWorkspace;
          } else {
            state.currentWorkspace = action.payload[0];
          }
        } else {
          state.currentWorkspace = action.payload[0];
        }
      }
      state.loading = false;
    });
    builder.addCase(fetchWorkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addProject,
  addTask,
  updateTask,
  deleteTask,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
