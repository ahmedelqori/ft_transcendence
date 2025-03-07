import { tournament } from "../models.js";

export default async function list_tournaments(req, res) {
    const tournaments = await tournament.findAll();
    res.send(tournaments);
}