import { redirect } from "next/navigation";

/** /start is an alias for the brief. */
export default function StartPage() {
  redirect("/quote");
}
