import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import { Loader2Icon } from "lucide-react";
import {
  CreateOrganization,
  SignIn,
  useAuth,
  useOrganization,
  useUser,
} from "@clerk/clerk-react";
import { fetchWorkspaces } from "../features/workspaceSlice";

const Layout = () => {
  const dispatch = useDispatch();
  const { loading, workspaces } = useSelector((state) => state.workspace);

  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { getToken } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  /* -------------------- Load theme once -------------------- */
  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  /* ---------------- Initial workspace fetch ---------------- */
  useEffect(() => {
    if (!userLoaded || !orgLoaded || !user || !organization?.id) return;

    dispatch(fetchWorkspaces({ getToken }))
      .finally(() => {
        setInitialLoadDone(true);
      });
  }, [userLoaded, orgLoaded, organization?.id, user, dispatch, getToken]);

  /* ---------------- Retry for newly created org ---------------- */
  useEffect(() => {
    if (
      !initialLoadDone ||
      !userLoaded ||
      !orgLoaded ||
      !organization?.id ||
      loading ||
      workspaces.length > 0 ||
      retryCount >= 3
    ) {
      return;
    }

    const delays = [3000, 5000, 7000];
    const timer = setTimeout(() => {
      dispatch(fetchWorkspaces({ getToken }));
      setRetryCount((prev) => prev + 1);
    }, delays[retryCount]);

    return () => clearTimeout(timer);
  }, [
    initialLoadDone,
    userLoaded,
    orgLoaded,
    organization?.id,
    loading,
    workspaces.length,
    retryCount,
    dispatch,
    getToken,
  ]);

  /* ---------------- Auth states ---------------- */
  if (!userLoaded || !orgLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-zinc-950">
        <SignIn />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-zinc-950">
        <CreateOrganization
          afterCreateOrganizationUrl="/"
          skipInvitationScreen
        />
      </div>
    );
  }

  /* ---------------- Initial app loader only ---------------- */
  if (!initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  /* ---------------- App layout (NO reloads here) ---------------- */
  return (
    <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 p-6 xl:p-10 xl:px-16 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;