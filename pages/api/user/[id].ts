import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const url = `${process.env.API_URL}/user/${req.query.id}`;

  try {
    const ares = await axios.get(url);
    res.status(ares.status).json(ares.data);
  } catch (e: any) {
    res.status(e.response.status).json(e.response.data);
  }
};
