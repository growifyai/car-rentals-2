import Link from "next/link";

export default function BookingNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Vehicle not found</h1>
        <p className="text-muted-foreground">
          The car you&apos;re looking for is no longer available or the link may be incorrect.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/cars" className="text-primary underline">
            Browse available cars
          </Link>
          <span className="text-muted-foreground">or</span>
          <Link href="/contact" className="text-primary underline">
            contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

