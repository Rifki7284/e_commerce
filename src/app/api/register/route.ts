import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/registerSchema";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email/sendOtp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // CASE 1: user sudah verified
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // CASE 2: user sudah ada tapi belum verified → resend OTP
    if (existingUser && !existingUser.emailVerified) {
      await prisma.user.update({
        where: { email },
        data: {
          otpHash,
          otpExpiredAt,
          otpAttempts: 0,
        },
      });

      await sendOtpEmail(email, otp);

      return NextResponse.json(
        {
          otpRequired: true,
          message: "OTP resent, please verify",
        },
        { status: 200 }
      );
    }

    // CASE 3: user baru
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "Client",
        emailVerified: false,
        otpHash,
        otpExpiredAt,
      },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json(
      {
        otpRequired: true,
        message: "Account created, OTP sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
