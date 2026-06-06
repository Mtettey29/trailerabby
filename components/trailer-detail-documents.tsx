import Link from "next/link";
import { FileText } from "lucide-react";
import { TrailerDetailCard } from "@/components/trailer-detail-card";
import type { Trailer } from "@/lib/types";

type TrailerDocument = {
  id: string;
  name: string;
  uploadedAt: string;
};

function deriveTrailerDocuments(trailer: Trailer): TrailerDocument[] {
  const base = new Date(trailer.updatedAt);
  const fmt = (offsetDays: number) => {
    const date = new Date(base);
    date.setDate(date.getDate() - offsetDays);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return [
    {
      id: `${trailer.id}-registration`,
      name: `Registration_${trailer.trailerNumber}.pdf`,
      uploadedAt: fmt(120),
    },
    {
      id: `${trailer.id}-insurance`,
      name: `Insurance_${trailer.trailerNumber}.pdf`,
      uploadedAt: fmt(90),
    },
    {
      id: `${trailer.id}-inspection`,
      name: `Inspection_${trailer.trailerNumber}.pdf`,
      uploadedAt: fmt(45),
    },
    {
      id: `${trailer.id}-tires`,
      name: `TireReport_${trailer.trailerNumber}.pdf`,
      uploadedAt: fmt(14),
    },
  ];
}

interface TrailerDetailDocumentsProps {
  trailer: Trailer;
  compact?: boolean;
}

export function TrailerDetailDocuments({
  trailer,
  compact = false,
}: TrailerDetailDocumentsProps) {
  const documents = deriveTrailerDocuments(trailer);

  const content = (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-start gap-3 border border-[#2f3336] bg-[#080808] p-3"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-none border border-[#f4212e]/30 bg-[#f4212e]/10">
            <FileText className="size-5 text-[#f4212e]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{doc.name}</p>
            <p className="mt-1 text-xs text-[#71767b]">{doc.uploadedAt}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (compact) {
    return (
      <TrailerDetailCard
        title="Documents"
        action={
          <span className="text-xs text-[#71767b]">Sample records</span>
        }
      >
        {content}
      </TrailerDetailCard>
    );
  }

  return (
    <TrailerDetailCard
      title="Documents"
      action={
        <Link
          href="#documents"
          className="text-xs text-[#1d9bf0] hover:underline"
        >
          View all
        </Link>
      }
    >
      {content}
      <p className="mt-4 text-xs text-[#71767b]">
        Document uploads are not enabled. Files shown are reference placeholders
        for this trailer.
      </p>
    </TrailerDetailCard>
  );
}
