const Organization = require("../models/Organization");
const Project = require("../models/Project");
const OrganizationMember = require("../models/OrganizationMember");

const express = require("express");
const router = express.Router();

const checkOrganizationMembership = async (req, res, next) => {
  try {
    const { organizationId } = req.body;
    const userId = req.user.id;

    const member = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId,
        isActive: true
      }
    });

    if (!member) {
      return res.status(403).json({ error: "You are not a member of this organization" });
    }

    req.member = member;
    next();
  } catch (error) {
    console.error("Error checking organization membership:", error);
    res.status(500).json({ error: "Failed to verify organization membership" });
  }
};

const checkAdminRole = async (req, res, next) => {
  try {
    if (req.member.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    res.status(500).json({ error: "Failed to verify admin role" });
  }
};

router.post("/", checkOrganizationMembership, async (req, res) => {
  try {
    const { organizationId, name, description } = req.body;
    const userId = req.user.id;
    const userName = req.user.username;

    if (!organizationId || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const project = await Project.create({
      organizationId,
      name,
      description,
      ownerId: userId,
      ownerName: userName,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/organization/:organizationId", async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const member = await OrganizationMember.findOne({
      where: {
        organizationId,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!member) {
      return res.status(403).json({ error: "You are not a member of this organization" });
    }

    const projects = await Project.findAll({
      where: { organizationId },
      order: [["createdAt", "DESC"]],
    });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const member = await OrganizationMember.findOne({
      where: {
        organizationId: project.organizationId,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!member) {
      return res.status(403).json({ error: "You are not a member of this organization" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.put("/:id", checkOrganizationMembership, checkAdminRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.organizationId !== req.member.organizationId) {
      return res.status(403).json({ error: "Project does not belong to your organization" });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.patch("/:id/archive", checkOrganizationMembership, checkAdminRole, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.organizationId !== req.member.organizationId) {
      return res.status(403).json({ error: "Project does not belong to your organization" });
    }

    project.isArchived = true;
    project.status = "archived";
    await project.save();

    res.json(project);
  } catch (error) {
    console.error("Error archiving project:", error);
    res.status(500).json({ error: "Failed to archive project" });
  }
});

router.patch("/:id/unarchive", checkOrganizationMembership, checkAdminRole, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.organizationId !== req.member.organizationId) {
      return res.status(403).json({ error: "Project does not belong to your organization" });
    }

    project.isArchived = false;
    project.status = "active";
    await project.save();

    res.json(project);
  } catch (error) {
    console.error("Error unarchiving project:", error);
    res.status(500).json({ error: "Failed to unarchive project" });
  }
});

router.delete("/:id", checkOrganizationMembership, checkAdminRole, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify project belongs to the organization
    if (project.organizationId !== req.member.organizationId) {
      return res.status(403).json({ error: "Project does not belong to your organization" });
    }

    await project.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
