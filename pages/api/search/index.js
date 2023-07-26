import { Profile } from "@models/index";
import { getUsers } from "../profiles";
import logger from "@config/logger";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== "GET") {
    return res
      .status(400)
      .json({ error: "Invalid request: GET request required" });
  }

  if (!slug) {
    return res
      .status(400)
      .json({ error: "Invalid request: search input is required" });
  }

  const cleanedSlug = slug
    .trim()
    .replace(/\s{2,}/g, " ")
    .toLowerCase();
  const terms = cleanedSlug.split(",");

  try {
    const filteredUsers = await Profile.find({
      $or: [
        { username: { $regex: new RegExp(cleanedSlug, "i") } },
        { name: { $regex: new RegExp(cleanedSlug, "i") } },
        { "location.name": { $regex: new RegExp(cleanedSlug, "i") } },
        { tags: {$regex:new RegExp(cleanedSlug,"i")}}
        //compare the tags already present with the tags given
      ],
    });
    console.log(filteredUsers);
    if (!filteredUsers.length) {
      return res.status(404).json({ error: `${cleanedSlug} not found` });
    }

    res.status(200).json({ users: filteredUsers });
  } catch (e) {
    logger.error(e, "ERROR fetch search users");
    res.status(500).json({ error: "Internal Server Error" });
  }
}
