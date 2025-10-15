import { ImageResponse } from "next/og";
import { APP_URL } from "~/lib/constants";

export const dynamic = 'force-dynamic';

export async function GET() {
  return new ImageResponse(
    (
      <div tw="flex h-full w-full items-center justify-center bg-white">
        <img
          src={`${APP_URL}/og-bitcoin.png`}
          alt="The Bitcoin White Paper"
          tw="w-full h-full object-contain"
        />
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}