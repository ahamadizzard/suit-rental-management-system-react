import Contributor from "../../models/inventory/contributorModel.js";

export async function getContributor(req, res) {
  try {
    const contributors = await Contributor.find();
    res.status(200).json(contributors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getContributorById(req, res) {
  try {
    const contributor = await Contributor.findById(req.params.id);
    res.status(200).json(contributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Export an async function to create a new item master
export async function createContributor(req, res) {
  try {
    const contributor = new Contributor(req.body);
    await contributor.save();
    res.status(201).json(contributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Export an async function to update an item master
export async function updateContributor(req, res) {
  try {
    const contributor = await Contributor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(contributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// delete item master
export async function deleteContributor(req, res) {
  try {
    const contributor = await Contributor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Contributor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
