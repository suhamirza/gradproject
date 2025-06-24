const Organization = require("../models/Organization");
const Project = require("../models/Project");
const OrganizationMember = require("../models/OrganizationMember");

const express = require("express");
const router = express.Router();



router.post("/", async (req, res) => {
  try {
    const { organizationId, name, description } = req.body;
    const userId = req.user.nameid;
    const userName = req.user.unique_name;

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

    

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
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

router.patch("/:id/archive", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
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

router.patch("/:id/unarchive", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
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

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    

    await project.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
