import type { NextPage, GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import cookie from 'cookie'
import { verify } from "jsonwebtoken";
import { useRouter } from "next/router";

interface IAuthToken {
  id: string;
}

interface IAppProps {
	authorized: boolean
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
	let authorized: boolean = false;

  if (req.headers.cookie) {
    const parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth,process.env.JWT_SECRET!) as IAuthToken;
      if (decoded.id == params!.id) authorized = true;
    }
  }

  return {
    props: {
			authorized: authorized
		},
  };
};

const EditPage: NextPage<IAppProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;

	useEffect(() => {
		if (!props.authorized) router.push(`../${id}`)
	})

  return (
		<>
			Edit page
		</>
	)
};

export default EditPage;
