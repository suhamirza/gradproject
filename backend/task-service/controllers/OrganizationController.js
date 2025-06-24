// Models
const Organization = require("../models/Organization");
const OrganizationMember = require("../models/OrganizationMember");
const { getUserProfileById } = require("../services/userService");
const { Op } = require("sequelize");

const express = require("express");
const router = express.Router();

// Create a new organization
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.nameid; // From NameIdentifier claim
    const userName = req.user.unique_name; // From Name claim

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Get the JWT token from the request headers
    const token = req.headers.authorization;
    const jwtToken = token.split(" ")[1];

    // Validate that the user exists
    const user = await getUserProfileById(userId, jwtToken);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const organization = await Organization.create({
      name,
      description,
      ownerId: userId,
      ownerName: userName,
    });

    const organizationMember = await OrganizationMember.create({
      organizationId: organization.id,
      userId: userId,
      userName: userName,
      role: "admin",
      joinedAt: new Date(),
      isActive: true,
    });

    res.status(201).json({
      message:
        "Organization created successfully and owner added to organization as admin",
      organization,
      organizationMember,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create organization", message: error.message });
  }
});

// Get all organizations (public access)
router.get("/", async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      where: { status: "active" },
    });

    const organizationResponse = organizations.map((organization) => {
      return {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        ownerName: organization.ownerName,
        createdAt: organization.createdAt,
        status: organization.status,
        isArchived: organization.isArchived,
        updatedAt: organization.updatedAt,
      };
    });

    res.json({
      message: "Active Organizations fetched successfully",
      organizations: organizationResponse,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error.message,
    });
  }
});

// Replace the /my-organizations endpoint with this corrected version:

router.get('/my-organizations', async (req, res) => {
  try {
    const userId = req.user.nameid;
    
    console.log('🔍 MY-ORGANIZATIONS DEBUG:');
    console.log('userId:', userId);
    console.log('userId type:', typeof userId);
    
    // Get all organization memberships for the user
    const membershipData = await OrganizationMember.findAll({
      where: { 
        userId: userId,
        isActive: true 
      },
      order: [['joinedAt', 'DESC']]
    });

    console.log('Found memberships:', membershipData.length);

    // Get the organizations for these memberships
    const organizationIds = membershipData.map(m => m.organizationId);
    
    if (organizationIds.length === 0) {
      return res.json({
        message: "No organizations found",
        organizations: []
      });
    }

    const organizations = await Organization.findAll({
      where: {
        id: organizationIds,
        isArchived: false,
        status: 'active'
      }
    });

    console.log('Found organizations:', organizations.length);

    // Transform the data to include member counts and user roles
    const organizationsWithDetails = await Promise.all(
      organizations.map(async (org) => {
        const memberCount = await OrganizationMember.count({
          where: { 
            organizationId: org.id,
            isActive: true
          }
        });

        // Find this user's membership for this organization
        const userMembership = membershipData.find(m => m.organizationId === org.id);

        return {
          ...org.toJSON(),
          memberCount,
          userRole: userMembership ? userMembership.role : 'member', // Include the user's role
          joinedAt: userMembership ? userMembership.joinedAt : org.createdAt
        };
      })
    );

    console.log('Final organizations with details:', organizationsWithDetails.length);

    res.json({
      message: "Organizations fetched successfully",
      organizations: organizationsWithDetails
    });
    
  } catch (error) {
    console.error('Error in /my-organizations:', error);
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error.message,
    });
  }
});
// Add this around line 160, right after the /my-organizations endpoint:

// Get a single organization by ID
router.get("/:id", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.nameid;

    console.log('🔍 GET SINGLE ORGANIZATION DEBUG:');
    console.log('organizationId:', organizationId);
    console.log('userId:', userId);

    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if user is a member of this organization
    const userMembership = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        isActive: true,
      },
    });

    if (!userMembership) {
      return res.status(403).json({
        error: "Access denied. You must be a member of this organization.",
      });
    }

    // Get member count
    const memberCount = await OrganizationMember.count({
      where: { 
        organizationId: organization.id,
        isActive: true
      }
    });

    // Get all members for this organization
    const allMembers = await OrganizationMember.findAll({
      where: {
        organizationId,
        isActive: true,
      },
      attributes: ["userId", "userName", "role", "joinedAt"],
      order: [["joinedAt", "ASC"]],
    });

    const organizationWithDetails = {
      ...organization.toJSON(),
      memberCount,
      userRole: userMembership.role,
      allMembers,
    };

    console.log('✅ Organization found with', allMembers.length, 'members');

    res.json({
      message: "Organization fetched successfully",
      organization: organizationWithDetails,
    });
  } catch (error) {
    console.error('Error in GET /organizations/:id:', error);
    res.status(500).json({
      error: "Failed to fetch organization",
      details: error.message,
    });
  }
});

// Update an organization
router.put("/:id", async (req, res) => {
  try {
    const { name, description, isArchived, status } = req.body;
    const organizationId = req.params.id;
    const userId = req.user.nameid;

    // Input validation
    if (name && typeof name !== 'string') {
      return res.status(400).json({ error: "Name must be a string" });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: "Description must be a string" });
    }
    if (isArchived !== undefined && typeof isArchived !== 'boolean') {
      return res.status(400).json({ error: "isArchived must be a boolean" });
    }
    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // First check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if user is an admin member of the organization
    const organizationMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        role: "admin",
        isActive: true,
      },
    });

    if (!organizationMember) {
      return res.status(403).json({
        error: "Access denied. Only admin members can update the organization.",
      });
    }

    const updateData = {
      name: name || organization.name,
      description: description !== undefined ? description : organization.description,
      isArchived: isArchived !== undefined ? isArchived : organization.isArchived,
      status: status || organization.status,
      updatedAt: new Date(),
    };

    await organization.update(updateData);

    res.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update organization", message: error.message });
  }
});

// Delete an organization (soft delete by archiving)
router.delete("/:id", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.nameid;
    const { force } = req.query;

    // First check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if organization is already archived
    if (organization.isArchived && !force) {
      return res.status(400).json({ 
        error: "Organization is already archived. Use force=true to archive again." 
      });
    }

    // Check if user is an admin member of the organization
    const organizationMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        role: "admin",
        isActive: true,
      },
    });

    if (!organizationMember) {
      return res.status(403).json({
        error: "Access denied. Only admin members can delete the organization.",
      });
    }

    // If force is true, also deactivate all members
    if (force) {
      await OrganizationMember.update(
        { isActive: false },
        { where: { organizationId } }
      );
    }

    await organization.update({
      isArchived: true,
      status: 'inactive',
      updatedAt: new Date(),
    });

    res.json({
      message: "Organization archived successfully",
      organization,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to archive organization",
        message: error.message,
      });
  }
});

// Get archived organizations
router.get("/archived", async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      where: { isArchived: true },
    });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch archived organizations" });
  }
});

// Restore an archived organization
router.post("/:id/restore", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.nameid; // Assuming user ID is available in req.user

    // First check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if user is an admin member of the organization
    const organizationMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        role: "admin",
        isActive: true,
      },
    });

    if (!organizationMember) {
      return res.status(403).json({
        error:
          "Access denied. Only admin members can restore the organization.",
      });
    }

    await organization.update({
      isArchived: false,
      updatedAt: new Date(),
    });

    res.json({
      message: "Organization restored successfully",
      organization,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to restore organization",
        message: error.message,
      });
  }
});

// Get all members of an organization GET endpoint: /organizations:organizationId/members
router.get("/:id/members", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.nameid;

    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const currentUserId = req.user.nameid;

    const organizationMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: currentUserId,
        isActive: true,
      },
    });

    if (!organizationMember) {
      return res.status(403).json({
        error:
          "Access denied. You must be a member of the organization to view its members.",
      });
    }

    // Check if user is a member of the organization
    const userMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        isActive: true,
      },
    });

    if (!userMember) {
      return res.status(403).json({
        error:
          "Access denied. You must be a member of the organization to view its members.",
      });
    }

    const members = await OrganizationMember.findAll({
      where: {
        organizationId,
        isActive: true,
      },
      attributes: ["userId", "userName", "role", "joinedAt"],
    });

    res.json({
      message: "Organization members fetched successfully",
      members,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch organization members",
        message: error.message,
      });
  }
});


// Add a member to an organization
router.post("/:id/members", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const { userId, userName, role } = req.body;
    const requesterId = req.user.nameid;

    if (!userId || !userName || !role) {
      return res
        .status(400)
        .json({ error: "userId, userName, and role are required" });
    }

    // Check if user is already a member
    const existingMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        isActive: true,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "User is already a member of this organization" });
    }

    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if requester is an admin
    const requesterMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: requesterId,
        role: "admin",
        isActive: true,
      },
    });

    if (!requesterMember) {
      return res.status(403).json({
        error: "Access denied. Only admin members can add new members.",
      });
    }

    // Validate that the user exists
    try {
      const userProfileData = await getUserProfileById(userId);

      const organizationMember = await OrganizationMember.create({
        organizationId,
        userId,
        userName: userProfileData.username,
        role,
        joinedAt: new Date(),
        isActive: true,
      });
  
      res.status(201).json({
        message: "Member added to organization successfully",
        member: organizationMember,
      });
    } catch (error) {
      console.error("Error getting user profile:", error.message);
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to add member to organization",
        message: error.message,
      });
  }
});

// Update a member's role in an organization
router.put("/:id/members/:memberId", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const memberId = req.params.memberId;
    const { role } = req.body;
    const requesterId = req.user.nameid;

    // Input validation
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'admin' or 'member'" });
    }

    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if requester is an admin
    const requesterMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: requesterId,
        role: "admin",
        isActive: true,
      },
    });

    if (!requesterMember) {
      return res.status(403).json({
        error: "Access denied. Only admin members can update member roles.",
      });
    }

    // Check if target member exists
    const targetMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: memberId,
        isActive: true,
      },
    });

    if (!targetMember) {
      return res.status(404).json({ error: "Member not found in organization" });
    }

    // Prevent removing the last admin
    if (role === 'member' && targetMember.role === 'admin') {
      const adminCount = await OrganizationMember.count({
        where: {
          organizationId,
          role: 'admin',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          error: "Cannot remove the last admin from the organization",
        });
      }
    }

    await targetMember.update({
      role,
      updatedAt: new Date(),
    });

    res.json({
      message: "Member role updated successfully",
      member: targetMember,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update member role",
      message: error.message,
    });
  }
});

// Remove a member from an organization
router.delete("/:id/members/:memberId", async (req, res) => {
  try {
    const organizationId = req.params.id;
    const memberId = req.params.memberId;
    const requesterId = req.user.nameid;

    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if requester is an admin
    const requesterMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: requesterId,
        role: "admin",
        isActive: true,
      },
    });

    if (!requesterMember) {
      return res.status(403).json({
        error: "Access denied. Only admin members can remove members.",
      });
    }

    // Check if target member exists
    const targetMember = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: memberId,
        isActive: true,
      },
    });

    if (!targetMember) {
      return res.status(404).json({ error: "Member not found in organization" });
    }

    // Prevent removing the last admin
    if (targetMember.role === 'admin') {
      const adminCount = await OrganizationMember.count({
        where: {
          organizationId,
          role: 'admin',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          error: "Cannot remove the last admin from the organization",
        });
      }
    }

    // Soft delete the member
    await targetMember.update({
      isActive: false,
      updatedAt: new Date(),
    });

    res.json({
      message: "Member removed from organization successfully",
      member: targetMember,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to remove member from organization",
      message: error.message,
    });
  }
});

module.exports = router;
