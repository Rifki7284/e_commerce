import { auth } from "@/lib/auth";
import ClientNavigation from "./client-navigation";

export default async function ClientHeader() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${baseUrl}/api/cart/length`, {
    cache: "no-store",
  });

  const cartCount: number = await res.json();

  const session = await auth();

  return (
    <ClientNavigation
      cartCount={cartCount}
      session={session?.user}
    />
  );
}
