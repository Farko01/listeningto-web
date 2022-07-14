import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = typeof req.body == "string" ? JSON.parse(req.body) : req.body;

  try {
    switch (req.method) {
      case "GET": {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${req.query.id}`;
        const ares = await axios.get(url);

        res.status(ares.status).json(ares.data);
        break;
      }

      case "PATCH": {
        const auth = req.headers.authorization;
      }
    }
  } catch (e: any) {
    res.status(e.response.status).json(e.response.data);
  }
};