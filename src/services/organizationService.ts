import { apiClients } from './httpClient';
import { API_CONFIG } from '../config/api';
import type { ApiError } from '../types/api';

// Local API call wrapper for organization service that returns data directly
const orgApiCall = async <T>(
  client: any,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<T> => {
  try {
    const response = await client.request({
      method,
      url: endpoint,
      data,
    });
    
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Organization interfaces matching backend structure
export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  status: 'active' | 'archived';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  userRole?: 'owner' | 'admin' | 'member';
}

export interface OrganizationMember {
  userId: string;
  userName: string;
  role: 'admin' | 'member';
  joinedAt: string;
  isActive: boolean;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export interface CreateOrganizationResponse {
  message: string;
  organization: Organization;
  organizationMember: OrganizationMember;
}

export interface GetOrganizationsResponse {
  message: string;
  organizations: Organization[];
}

export interface GetOrganizationResponse {
  message: string;
  organization: Organization & {
    allMembers: OrganizationMember[];
  };
}

// Organization service functions
export const organizationService = {  // Create a new organization
  createOrganization: async (data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
    console.log('organizationService.createOrganization called with data:', data);
    
    const result = await orgApiCall<CreateOrganizationResponse>(
      apiClients.taskService,
      'POST',
      API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS,
      data
    );
    
    console.log('organizationService.createOrganization result:', result);
    return result;
  },

  // Get all organizations for current user
  getMyOrganizations: async (): Promise<GetOrganizationsResponse> => {
    return await orgApiCall<GetOrganizationsResponse>(
      apiClients.taskService,
      'GET',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/my-organizations`
    );
  },

  // Get all active organizations (public)
  getAllOrganizations: async (): Promise<GetOrganizationsResponse> => {
    return await orgApiCall<GetOrganizationsResponse>(
      apiClients.taskService,
      'GET',
      API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS
    );
  },

  // Get organization by ID
  getOrganizationById: async (id: string): Promise<GetOrganizationResponse> => {
    return await orgApiCall<GetOrganizationResponse>(
      apiClients.taskService,
      'GET',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${id}`
    );
  },
  // Update organization
  updateOrganization: async (
    id: string, 
    data: Partial<CreateOrganizationRequest>
  ): Promise<{ message: string; organization: Organization }> => {
    return await orgApiCall(
      apiClients.taskService,
      'PUT',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${id}`,
      data
    );
  },

  // Join organization using workspace ID
  joinOrganization: async (organizationId: string): Promise<{ message: string; organization: Organization; member: OrganizationMember }> => {
    return await orgApiCall(
      apiClients.taskService,
      'POST',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${organizationId}/join`
    );
  },  // Delete/Archive organization
  deleteOrganization: async (id: string): Promise<{ message: string; organization: Organization }> => {
    try {
      console.log('Attempting to delete organization with ID:', id);
      
      // Always try with force=true first since we're the owner
      const result = await orgApiCall<{ message: string; organization: Organization }>(
        apiClients.taskService,
        'DELETE',
        `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${id}?force=true`
      );
      
      console.log('Delete organization result:', result);
      return result;
    } catch (error: any) {
      console.error('Delete organization error:', error);
      
      // More detailed error handling
      if (error.statusCode === 400) {
        throw new Error(error.message || 'Bad request - check if you have permission to delete this organization');
      } else if (error.statusCode === 401) {
        throw new Error('Authentication failed - please log in again');
      } else if (error.statusCode === 403) {
        throw new Error('Access denied - you must be an admin to delete this organization');
      } else if (error.statusCode === 404) {
        throw new Error('Organization not found');
      } else {
        throw new Error(error.message || 'Failed to delete organization');
      }
    }
  },

  // Get organization members
  getOrganizationMembers: async (id: string): Promise<{ message: string; members: OrganizationMember[] }> => {
    return await orgApiCall(
      apiClients.taskService,
      'GET',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${id}/members`
    );
  },

  // Add member to organization
  addOrganizationMember: async (
    id: string, 
    memberData: { userId: string; userName: string; role: 'admin' | 'member' }
  ): Promise<{ message: string; member: OrganizationMember }> => {
    return await orgApiCall(
      apiClients.taskService,
      'POST',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${id}/members`,
      memberData
    );
  },

  // Update member role
  updateMemberRole: async (
    organizationId: string,
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<{ message: string; member: OrganizationMember }> => {
    return await orgApiCall(
      apiClients.taskService,
      'PUT',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${organizationId}/members/${memberId}`,
      { role }
    );
  },

  // Remove member from organization
  removeMember: async (
    organizationId: string,
    memberId: string
  ): Promise<{ message: string; member: OrganizationMember }> => {
    return await orgApiCall(
      apiClients.taskService,
      'DELETE',
      `${API_CONFIG.ENDPOINTS.TASKS.ORGANIZATIONS}/${organizationId}/members/${memberId}`
    );
  }
};
