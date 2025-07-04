import GroupMaster from "../../models/inventory/groupMasterModel.js";

export async function getGroupMaster(req, res) {
  try {
    // Find all item masters in the database
    const groupMaster = await GroupMaster.find();
    // Return a 200 status code and the item masters
    res.status(200).json(groupMaster);
  } catch (error) {
    // If an error occurs, return a 500 status code and the error message
    res.status(500).json({ message: error.message });
  }
}

export async function getGroupMasterOld(req, res) {
  try {
    const groupMaster = await GroupMaster.find();

    // Explicitly return empty array if no documents found
    if (!groupMaster || groupMaster.length === 0) {
      return res.status(200).json([]); // Send empty array instead of 204
    }

    res.status(200).json(groupMaster); // Always return 200 with data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getGroupMasterById(req, res) {
  const groupId = req.params.groupId;
  try {
    const groupMaster = await GroupMaster.findOne({ groupId: groupId });
    if (!groupMaster) return res.status(404).send("Group not found");
    res.status(200).json(groupMaster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Export an async function to create a new item master
export async function createGroupMaster(req, res) {
  // Create a new item master with the data from the request body
  const groupMaster = new GroupMaster({
    groupId: req.body.groupId,
    groupName: req.body.groupName,
    groupShortName: req.body.groupShortName,
    groupDescription: req.body.groupDescription,
  });
  try {
    // Save the new item master to the database
    const savedGroupMaster = await groupMaster.save();
    // Return a 201 status code and the saved item master
    res
      .status(201)
      .json({ message: "Group Created Successfully", savedGroupMaster });
  } catch (error) {
    // If an error occurs, return a 400 status code and the error message
    res.status(400).json({ message: error.message });
  }
}
// Export an async function to update an item master
export async function updateGroupMaster(req, res) {
  try {
    // Find the group master by groupId (not _id)
    const groupMaster = await GroupMaster.findOne({
      groupId: req.params.groupId,
    });

    if (!groupMaster) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Update fields
    groupMaster.groupId = req.body.groupId;
    groupMaster.groupName = req.body.groupName;
    groupMaster.groupShortName = req.body.groupShortName;
    groupMaster.groupDescription = req.body.groupDescription;

    // Save the updated group
    const updatedGroupMaster = await groupMaster.save();
    res.status(200).json(updatedGroupMaster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
// export async function updateGroupMaster(req, res) {
//   try {
//     // Find the group master by id in the database
//     const groupMaster = await GroupMaster.findById(req.params.groupId);

//     groupMaster.groupId = req.body.groupId;
//     groupMaster.groupName = req.body.groupName;
//     groupMaster.groupShortName = req.body.groupShortName;
//     groupMaster.groupDescription = req.body.groupDescription;

//     // Save the updated item master to the database
//     const updatedGroupMaster = await groupMaster.save();
//     // Return a 200 status code and the updated item master
//     res.status(200).json(updatedGroupMaster);
//   } catch (error) {
//     // If an error occurs, return a 400 status code and the error message
//     res.status(400).json({ message: error.message });
//   }
// }

export async function getLastGroupId(req, res) {
  try {
    // Find the last group by sorting in descending order of groupId
    const lastGroup = await GroupMaster.findOne().sort({ groupId: -1 });

    if (!lastGroup) {
      // If no groups exist, return '000' as the last ID
      return res.status(200).json({ lastGroupId: "000" });
    }

    // Return the last groupId
    res.status(200).json({ lastGroupId: lastGroup.groupId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// delete group master
export async function deleteGroupMaster(req, res) {
  const groupId = req.params.groupId;
  try {
    const groupMaster = await GroupMaster.findOneAndDelete({
      groupId: groupId,
    });
    if (!groupMaster) return res.status(404).send("Group not found");
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
