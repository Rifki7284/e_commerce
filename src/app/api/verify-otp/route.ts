import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    // 1️⃣ Validasi input
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Cari user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Sudah verified → stop
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // 4️⃣ OTP tidak tersedia
    if (!user.otpHash || !user.otpExpiredAt) {
      return NextResponse.json(
        { error: "OTP not found or already used" },
        { status: 400 }
      );
    }

    // 5️⃣ OTP expired
    if (user.otpExpiredAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      );
    }

    // 6️⃣ Limit attempt (anti brute-force)
    if ((user.otpAttempts ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Too many invalid attempts, try again later" },
        { status: 429 }
      );
    }

    // 7️⃣ Compare OTP (hash)
    const isValidOtp = await bcrypt.compare(otp, user.otpHash);

    if (!isValidOtp) {
      await prisma.user.update({
        where: { email },
        data: {
          otpAttempts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 8️⃣ OTP BENAR → VERIFY USER
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        otpHash: null,
        otpExpiredAt: null,
        otpAttempts: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
