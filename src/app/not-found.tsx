import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300">{t("title")}</h1>
      <p className="mt-4 text-lg text-gray-600">{t("message")}</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}
