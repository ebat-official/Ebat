"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import verificationIcon from "@/assets/img/verificationIcon.webp";
import verificationBackground from "@/assets/img/verificationBackground.avif";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonLoader } from "react-spinners";
import FormError from "@/components/shared/FormError";
import FormSuccess from "@/components/shared/FormSuccess";
import { ERROR, LOADING, SUCCESS, TOKEN, TOKEN_NOT_FOUND, VERIFICATION_SUCCESSFULL } from "@/utils/contants";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteVerificationToken, validateVerificationToken } from "@/actions/auth";
import { setEmailVerified } from "@/actions/user";
import { SOMETHING_WENT_WRONG_ERROR } from "@/utils/errors";

interface UserVerificationProps {}

const UserVerification: FC<UserVerificationProps> = () => {
  const [VerificationStatus, setVerificationStatus] = useState<{ type: string; data: any }>({
    type: LOADING,
    data: "",
  });
  const [timer, setTimer] = useState(3);
  const intrvl: any = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationToken = searchParams.get(TOKEN);

  useEffect(() => {
    if (VerificationStatus.type !== LOADING) {
      intrvl.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intrvl.current);
  }, [VerificationStatus]);

  async function verifyToken() {
    if (!verificationToken) {
      setVerificationStatus({ type: ERROR, data: TOKEN_NOT_FOUND });
      return;
    }
    const data = await validateVerificationToken(verificationToken);
    if (data.type === ERROR) {
      return setVerificationStatus(data);
    }

    if (!(typeof data.data === "object")) {
      return setVerificationStatus(SOMETHING_WENT_WRONG_ERROR);
    }
    const setVerifyEmail = await setEmailVerified(data.data?.email);
    if (!setVerifyEmail) {
      return setVerificationStatus(SOMETHING_WENT_WRONG_ERROR);
    }
    setVerificationStatus({ type: SUCCESS, data: VERIFICATION_SUCCESSFULL });
    deleteVerificationToken(data.data.email);
  }

  if (timer == 0) {
    clearInterval(intrvl.current);
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
            <Image className="w-20 h-20" src={verificationIcon} alt="verification-icon" />
            <CardTitle className="section__subtitle">Authentication</CardTitle>
          </div>
          <CardDescription className="text-center -mt-4">Confirming your verification</CardDescription>
        </CardHeader>
        <CardContent>
          {VerificationStatus?.type === LOADING && <MoonLoader className="text-blue-500" />}
          {VerificationStatus?.type === ERROR && <FormError message={VerificationStatus.data} />}
          {VerificationStatus?.type === SUCCESS && <FormSuccess message={VerificationStatus.data} />}
        </CardContent>
        <CardFooter className="grid items-center">
          {VerificationStatus?.type !== LOADING && (
            <p className="text-sm text-slate-400 text-center">You will be redirected to login in {timer} seconds</p>
          )}
          <Button variant="link">Back to login</Button>
        </CardFooter>
      </Card>
      <Image className="opacity-70 object-cover" fill={true} src={verificationBackground} alt="background" />
    </div>
  );
};

export default UserVerification;
