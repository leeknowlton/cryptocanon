import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const dynamic = "force-dynamic";

const MAX_QUOTE_LENGTH = 280;

const sanitizeQuote = (raw?: string | string[]): string => {
  if (!raw) {
    return "";
  }

  const value = Array.isArray(raw) ? raw[0] : raw;

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const quote = sanitizeQuote(resolvedParams?.text);
  const imageUrl = `${APP_URL}/api/opengraph-quote?text=${encodeURIComponent(
    quote || APP_DESCRIPTION,
  )}`;

  return {
    title: `${APP_NAME} – Quote`,
    description: quote || APP_DESCRIPTION,
    openGraph: {
      title: APP_NAME,
      description: quote || APP_DESCRIPTION,
      images: [imageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(getMiniAppEmbedMetadata(imageUrl)),
    },
  };
}

export default function QuoteSharePage() {
  redirect("/");
}
