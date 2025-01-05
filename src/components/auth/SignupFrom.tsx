"use client";
import React, { FC, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ButtonDark from "@/components/shared/ButtonDark";
// import useRegisterUser from '@/hooks/useRegisterUser';
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/actions/auth";
import { useServerAction } from "@/hooks/useServerAction";
import EmailVerificationModal from "./EmailVerificationModal";

type FormValues = {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
};

const schema = z.object({
  name: z.string().min(2, "Name must contain at least 2 character(s)").max(25),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character (!@#$%^&*)",
    }),
  termsAccepted: z.boolean().refine((data) => data === true, {
    message: "You must accept the terms and conditions",
  }),
});

const resolver: Resolver<FormValues> = zodResolver(schema);

interface SignupFormProps {
  modelHandler?: Function;
}

const SignupForm: FC<SignupFormProps> = ({ modelHandler }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver });
  const [openEmailVerification, setOpenEmailVerification] = useState(false);
  const [userData, setUserData] = useState({ email: "" });
  // const mutation = useRegisterUser();
  const [runActionSignup, isLoading] = useServerAction(signUp);
  const {toast}=useToast()

  const onSubmit = handleSubmit(async (userData) => {
    setUserData(userData);
    const result = await runActionSignup(userData);
    if (result?.type === "success") {
      setOpenEmailVerification(true);
    }
    if (result?.type === "error") {
      return toast({
        title: "Error",
        description: String(result.data),
        variant: "destructive",
      });
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
          <input
            {...register("name")}
            type="text"
            className={cn(
              "text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow",
              { "border-red-500": errors?.name },
            )}
            placeholder="Name"
            aria-label="Name"
          />
          {errors?.name && <p className="text-sm text-red-500 dark:text-red-900">{errors.name.message}</p>}
        </div>
        <div className="mb-4">
          <input
            {...register("email")}
            type="email"
            className={cn(
              "text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow",
              { "border-red-500": errors?.email },
            )}
            placeholder="Email"
            aria-label="Email"
          />
          {errors?.email && <p className="text-sm text-red-500 dark:text-red-900">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <input
            {...register("password")}
            type="password"
            className={cn(
              "text-sm focus:shadow-soft-primary-outline leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow",
              { "border-red-500": errors?.password },
            )}
            placeholder="Password"
            aria-label="Password"
          />
          {errors?.password && <p className="text-sm text-red-500 dark:text-red-900">{errors.password.message}</p>}
        </div>
        <div className="min-h-[6px] flex gap-2 items-center">
          <input
            {...register("termsAccepted")}
            id="terms"
            className={cn(
              "w-5 h-5 ease-soft  rounded-md checked:bg-gradient-to-tl checked:from-gray-900 checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative float-left  cursor-pointer appearance-none border border-solid border-slate-200 bg-white bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['\f00c'] checked:border-0 checked:border-transparent checked:bg-transparent checked:after:opacity-100",
              { " border-red-500 ": errors.termsAccepted },
            )}
            type="checkbox"
          />
          <label className=" text-sm font-normal cursor-pointer select-none text-slate-700" htmlFor="terms">
            I agree the{" "}
            <Link href="#" passHref={true} onClick={() => {}} className="font-bold text-slate-700">
              Terms and Conditions
            </Link>
          </label>
        </div>
        {errors?.termsAccepted && (
          <p className="text-sm text-red-500 dark:text-red-900">{errors.termsAccepted.message}</p>
        )}
        <div className="text-center">
          <ButtonDark type="submit" title="sign up" loading={isLoading} />
        </div>
      </form>
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
export default SignupForm;
