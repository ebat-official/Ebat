"use client";

import React, { FC, useEffect, useRef, useState, Suspense } from "react";
import verificationIcon from "@/assets/img/verificationIcon.webp";
import verificationBackground from "@/assets/img/verificationBackground.avif";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonLoader } from "react-spinners";
import FormError from "@/components/shared/FormError";
import FormSuccess from "@/components/shared/FormSuccess";
import {
  ERROR,
  LOADING,
  SUCCESS,
  TOKEN,
  TOKEN_NOT_FOUND,
  VERIFICATION_SUCCESSFULL,
} from "@/utils/contants";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteVerificationToken,
  validateVerificationToken,
} from "@/actions/auth";
import { setEmailVerifiedUsingToken } from "@/actions/user";
import { SOMETHING_WENT_WRONG_ERROR } from "@/utils/errors";

const UserVerification: FC = () => {
  const [VerificationStatus, setVerificationStatus] = useState<{
    status: string;
    data: any;
  }>({
    status: LOADING,
    data: "",
  });
  const [timer, setTimer] = useState(3);
  const intrvl = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationToken = searchParams.get(TOKEN);

  useEffect(() => {
    if (VerificationStatus.status !== LOADING) {
      intrvl.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intrvl.current) clearInterval(intrvl.current);
    };
  }, [VerificationStatus]);

  async function verifyToken() {
    if (!verificationToken) {
      setVerificationStatus({ status: ERROR, data: TOKEN_NOT_FOUND });
      return;
    }
    const data = await validateVerificationToken(verificationToken);
    if (data.status === ERROR) {
      return setVerificationStatus(data);
    }

    if (!(typeof data.data === "object")) {
      return setVerificationStatus(SOMETHING_WENT_WRONG_ERROR);
    }
    const setVerifyEmail = await setEmailVerifiedUsingToken(verificationToken);
    if (!setVerifyEmail) {
      return setVerificationStatus(SOMETHING_WENT_WRONG_ERROR);
    }
    setVerificationStatus({ status: SUCCESS, data: VERIFICATION_SUCCESSFULL });
    // @ts-ignore
    deleteVerificationToken(data.data.email);
  }

  if (timer === 0) {
    if (intrvl.current) clearInterval(intrvl.current);
    router.push("/");
  }

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <div className="flex justify-center items-center w-screen h-screen backdrop-blur-3xl ">
      <Card className=" min-w-[20rem] relative z-10 flex flex-col justify-center items-center px-12 lg:px-16 mx-2">
        <CardHeader>
          <div className="flex  items-center justify-center">
            <Image
              className="w-20 h-20"
              src={verificationIcon}
              alt="verification-icon"
            />
            <CardTitle className="section__subtitle">Authentication</CardTitle>
          </div>
          <CardDescription className="text-center -mt-4">
            Confirming your verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {VerificationStatus?.status === LOADING && (
            <MoonLoader className="text-blue-500" />
          )}
          {VerificationStatus?.status === ERROR && (
            <FormError message={VerificationStatus.data} />
          )}
          {VerificationStatus?.status === SUCCESS && (
            <FormSuccess message={VerificationStatus.data} />
          )}
        </CardContent>
        <CardFooter className="grid items-center">
          {VerificationStatus?.status !== LOADING && (
            <p className="text-sm text-slate-400 text-center">
              You will be redirected to login in {timer} seconds
            </p>
          )}
          <Button variant="link">Back to login</Button>
        </CardFooter>
      </Card>
      <Image
        className="opacity-70 object-cover"
        fill={true}
        src={verificationBackground}
        alt="background"
      />
    </div>
  );
};

export default function UserVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserVerification />
    </Suspense>
  );
}
