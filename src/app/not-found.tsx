import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm uppercase tracking-[0.34em] text-neon-blue">404</p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-white md:text-6xl">
        Энэ зам одоогоор хоосон байна.
      </h1>
      <Button asChild>
        <Link href="/">Буцах</Link>
      </Button>
    </div>
  );
}
