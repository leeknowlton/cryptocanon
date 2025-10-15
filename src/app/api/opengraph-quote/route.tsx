import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { paperMetadata } from "~/lib/bitcoinPaper";
import { APP_NAME } from "~/lib/constants";

export const dynamic = "force-dynamic";

const MAX_QUOTE_LENGTH = 280;

const sanitizeQuote = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  const normalized = decoded.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  return normalized.length > MAX_QUOTE_LENGTH
    ? normalized.slice(0, MAX_QUOTE_LENGTH)
    : normalized;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quote = sanitizeQuote(searchParams.get("text"));
  const displayQuote =
    quote ||
    "In this paper, we propose a solution to the double-spending problem using a peer-to-peer distributed timestamp server.";

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full items-center justify-center bg-[#050915] text-white"
        style={{ fontFamily: '"Inter", "Helvetica Neue", sans-serif' }}
      >
        <div tw="flex h-[90%] w-[88%] flex-col justify-between rounded-[36px] border border-[#1E293B] bg-[rgba(15,23,42,0.92)] p-20 shadow-[0px_40px_120px_rgba(3,7,18,0.55)]">
          <div tw="text-7xl text-[#38bdf8]">&ldquo;</div>
          <p tw="text-4xl leading-tight whitespace-pre-wrap text-[#F8FAFC]">
            {displayQuote}
          </p>
          <div tw="flex items-center justify-between pt-10">
            <div tw="flex flex-col">
              <span tw="text-2xl font-semibold text-[#38bdf8]">
                {paperMetadata.author}
              </span>
              <span tw="text-xl text-[#94A3B8]">{paperMetadata.title}</span>
            </div>
            <div tw="text-xl text-[#64748B]">{APP_NAME}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    },
  );
}
