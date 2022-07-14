import type { NextPage, GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import cookie from "cookie";
import { verify } from "jsonwebtoken";
import { useRouter } from "next/router";
import axios from "axios";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  authorized: boolean;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  let authorized: boolean = false;
  let parsedCookies: any;

  if (req.headers.cookie) {
    parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth, process.env.JWT_SECRET!) as IAuthToken;
      if (decoded.id == params!.id) authorized = true;
    }
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}`;
  const res = await axios.get(url, authorized ? { headers: { Authorization: `Bearer ${parsedCookies!.auth}` } } : undefined);

  return {
    props: {
      authorized: authorized,
	  data: res.data
    },
  };
};

const EditPage: NextPage<IAppProps> = (props) => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!props.authorized) router.push(`../${id}`);
  });

  return <>Edit page</>;
};

export default EditPage;
