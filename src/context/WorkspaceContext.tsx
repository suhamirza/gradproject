import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { organizationService, type Organization } from '../services/organizationService';

export interface WorkspaceContextType {
  currentWorkspace: Organization | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: Organization | null) => void;
  updateWorkspace: (updates: Partial<Organization>) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceId = searchParams.get('workspace');
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Organization | null>(() => {
    // Try to restore workspace from localStorage
    try {
      const saved = localStorage.getItem('currentWorkspace');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  // Load workspace when workspaceId changes
  useEffect(() => {
    console.log('🏢 WorkspaceContext: workspaceId changed to:', workspaceId);
    console.log('🏢 WorkspaceContext: current URL:', window.location.href);
    console.log('🏢 WorkspaceContext: currentWorkspace:', currentWorkspace?.id);
    
    if (workspaceId) {
      // If the workspace ID in URL is different from current, load new workspace
      if (!currentWorkspace || currentWorkspace.id !== workspaceId) {
        console.log('🏢 WorkspaceContext: Loading workspace:', workspaceId);
        loadWorkspace(workspaceId);
      } else {
        console.log('🏢 WorkspaceContext: Workspace already loaded, skipping');
      }
    } else if (currentWorkspace) {
      // If no workspace in URL but we have one cached, keep it
      console.log('🏢 WorkspaceContext: No workspaceId in URL, but keeping cached workspace:', currentWorkspace.id);
      // Optionally update URL to include workspace ID
      setSearchParams({ workspace: currentWorkspace.id });
    } else {
      console.log('🏢 WorkspaceContext: No workspaceId and no cached workspace');
    }
  }, [workspaceId]);  const loadWorkspace = async (id: string) => {
    try {
      console.log('🏢 WorkspaceContext: Starting to load workspace:', id);
      setIsLoading(true);
      setError(null);
      const response = await organizationService.getOrganizationById(id);
      const workspace = response.organization;
      
      setCurrentWorkspace(workspace);
      // Persist to localStorage
      localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
      console.log('✅ WorkspaceContext: Workspace loaded and saved:', workspace);
    } catch (error: any) {
      console.error('❌ WorkspaceContext: Failed to load workspace:', error);
      setError(error.message ?? 'Failed to load workspace');
      setCurrentWorkspace(null);
      localStorage.removeItem('currentWorkspace');
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkspace = async (updates: Partial<Organization>) => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Update in database
      const response = await organizationService.updateOrganization(currentWorkspace.id, {
        name: updates.name,
        description: updates.description
      });
      
      // Update local state
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
      console.log('Workspace updated:', response.organization);
    } catch (error: any) {
      console.error('Failed to update workspace:', error);
      setError(error.message ?? 'Failed to update workspace');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (newWorkspaceId: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('workspace', newWorkspaceId);
      return newParams;
    });
  };
  const refreshWorkspace = async () => {
    if (workspaceId) {
      await loadWorkspace(workspaceId);
    }
  };

  // Wrapper for setCurrentWorkspace that also handles localStorage
  const setCurrentWorkspaceWithPersistence = (workspace: Organization | null) => {
    setCurrentWorkspace(workspace);
    if (workspace) {
      localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('currentWorkspace');
    }
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaceId,
    isLoading,
    error,
    setCurrentWorkspace: setCurrentWorkspaceWithPersistence,
    updateWorkspace,
    switchWorkspace,
    refreshWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
