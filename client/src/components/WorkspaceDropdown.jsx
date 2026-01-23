import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import {
  useClerk,
  useOrganizationList,
  useOrganization,
} from "@clerk/clerk-react";

function WorkspaceDropdown() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { pageSize: 20 },
    usePreviousData: true
  });
  const { organization: activeOrganization } = useOrganization();
  const { openCreateOrganization } = useClerk();
  const dispatch = useDispatch();

  // Get workspaces from Redux to access full workspace data
  const workspaces = useSelector((state) => state.workspace.workspaces);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const onSelectWorkspace = (organization) => {
    // Set active organization in Clerk
    setActive({ organization: organization.id });
    
    // Dispatch only the workspace ID to Redux
    // The reducer will find the full workspace data from state.workspaces
    dispatch(setCurrentWorkspace(organization.id));
    
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="relative m-4" ref={dropdownRef}>
      {/* 🔹 Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-14 flex items-center gap-3 px-3 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        {/* Avatar */}
        <img
          src={activeOrganization?.imageUrl || "/org-placeholder.png"}
          alt={activeOrganization?.name}
          className="w-9 h-9 rounded-md flex-shrink-0"
        />

        {/* Text block (LOCKED) */}
        <div className="flex flex-col justify-center min-w-0 leading-tight">
          <p className="text-sm font-semibold truncate text-gray-800 dark:text-white">
            {activeOrganization?.name || "Select Workspace"}
          </p>
          <p className="text-xs truncate text-gray-500 dark:text-zinc-400">
            {userMemberships?.data?.length || 0} workspace
            {userMemberships?.data?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown className="ml-auto w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
      </button>

      {/* 🔹 Dropdown */}
      {isOpen && userMemberships?.data && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg">
          <div className="p-2">
            <p className="text-xs uppercase tracking-wider mb-2 px-2 text-gray-500 dark:text-zinc-400">
              Workspaces
            </p>

            {userMemberships.data.map(({ organization }) => (
              <div
                key={organization.id}
                onClick={() => onSelectWorkspace(organization)}
                className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <img
                  src={organization.imageUrl || "/org-placeholder.png"}
                  alt={organization.name}
                  className="w-6 h-6 rounded flex-shrink-0"
                />

                <div className="flex flex-col justify-center min-w-0 leading-tight flex-1">
                  <p className="text-sm font-medium truncate text-gray-800 dark:text-white">
                    {organization.name}
                  </p>
                  <p className="text-xs truncate text-gray-500 dark:text-zinc-400">
                    {organization.membersCount ?? 0} members
                  </p>
                </div>

                {activeOrganization?.id === organization.id && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-200 dark:border-zinc-700" />

          <div
            onClick={() => {
              openCreateOrganization();
              setIsOpen(false);
            }}
            className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <p className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <Plus className="w-4 h-4" />
              Create Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDropdown;
