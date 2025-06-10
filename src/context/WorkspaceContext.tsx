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
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workspace when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
    } else {
      setCurrentWorkspace(null);
    }
  }, [workspaceId]);

  const loadWorkspace = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await organizationService.getOrganizationById(id);
      setCurrentWorkspace(response.organization);
      console.log('Workspace loaded in context:', response.organization);
    } catch (error: any) {
      console.error('Failed to load workspace:', error);
      setError(error.message ?? 'Failed to load workspace');
      setCurrentWorkspace(null);
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

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaceId,
    isLoading,
    error,
    setCurrentWorkspace,
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
