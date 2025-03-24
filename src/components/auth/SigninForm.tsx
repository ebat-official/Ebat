"use client";
import React, { FC, useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import ButtonBlue from "@/components/shared/ButtonBlue";
// import useLoginUser from '@/hooks/useLoginUser';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import {
  EMAIL_NOT_VERIFIED,
  EMAIL_VALIDATION,
  EMAIL_VERIFICATION,
  ERROR,
  LOADING,
} from "@/utils/contants";
import ForgotPassword from "./ForgotPassword";
import { logIn, upsertVerificationToken } from "@/actions/auth";
import EmailVerificationModal from "./EmailVerificationModal";
import { useServerAction } from "@/hooks/useServerAction";
import mailer from "@/lib/mailer";
import { Input } from "@/components/ui/input";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import parseRedirectError from "@/utils/parseRedirectError";

type FormValues = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Please enter your password"),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

interface SigninFormProps {
  modelHandler?: Function;
}

const SigninForm: FC<SigninFormProps> = ({ modelHandler }) => {
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openEmailVerification, setOpenEmailVerification] = useState(false);
  const [userData, setUserData] = useState({ email: "" });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver });
  // const mutation = useLoginUser();
  const searchParams = useSearchParams();
  const verificationEmail = searchParams.get(EMAIL_VERIFICATION);
  const [runActionSignin, isLoading] = useServerAction(logIn);
  const [formStatus, setFormStatus] = useState({ type: LOADING, data: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (verificationEmail) {
      setOpenEmailVerification(true);
      setUserData({ email: verificationEmail });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (openEmailVerification && userData.email) {
        const verification = await upsertVerificationToken(userData.email);
        if (verification.status === ERROR) {
          return toast({
            title: "Error",
            description: verification.data,
            variant: "destructive",
          });
        }
        mailer(userData.email, EMAIL_VALIDATION, verification.data?.token);
      }
    })();
  }, [openEmailVerification]);

  const onSubmit = handleSubmit(async (userData) => {
    try {
      setUserData(userData);
      const result = await runActionSignin(userData);

      if (result?.status === "success") {
        if (modelHandler) modelHandler(false);
        return;
      }
      if (result?.status === "error") {
        if (result.cause === EMAIL_NOT_VERIFIED) {
          setOpenEmailVerification(true);
          await upsertVerificationToken(userData.email);
          return;
        }
        return toast({
          title: "Error",
          description: result?.data?.message || JSON.stringify(result),
          variant: "destructive",
        });
      }
    } catch (error) {
      if (isRedirectError(error)) {
        const redirectInfo = parseRedirectError(error);
        if (redirectInfo?.url) window.location.href = redirectInfo.url;
      }
    }
  });

  const emailVerificationCloseHanlder = () => {
    if (modelHandler) modelHandler(false);
    setOpenEmailVerification((prev) => !prev);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="text-left" noValidate>
        <div className="mb-4">
          <Input
            {...register("email")}
            type="email"
            className={cn({ "border-red-500": errors?.email })}
            placeholder="Email"
            aria-label="Email"
            autoComplete="username"
            name="email"
          />
          {errors?.email && (
            <p className="text-sm text-red-500 dark:text-red-900">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <Input
            {...register("password")}
            type="password"
            name="password"
            className={cn({ "border-red-500": errors?.password })}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
          />
          {errors?.password && (
            <p className="text-sm text-red-500 dark:text-red-900">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-end w-full text-xs text-slate-500 ">
          <button
            aria-label="forgot password"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenResetDialog(true);
            }}
          >
            Forgot password ?
          </button>
        </div>
        <div className="text-center">
          <ButtonBlue type="submit" title="sign in" loading={isLoading} />
        </div>
      </form>
      {openResetDialog && (
        <ForgotPassword
          open={openResetDialog}
          dialogHandler={() => setOpenResetDialog((prev) => !prev)}
          email={userData?.email}
        />
      )}
      {openEmailVerification && (
        <EmailVerificationModal
          open={openEmailVerification}
          dialogHandler={emailVerificationCloseHanlder}
          email={userData?.email || ""}
        />
      )}
    </>
  );
};
export default SigninForm;
