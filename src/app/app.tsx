"use client";

import { APP_NAME } from "~/lib/constants";
import App from "~/components/App";

export default function AppWrapper(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return <App title={title} />;
}
