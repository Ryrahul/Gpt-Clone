"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import { ExternalLink } from "lucide-react";

interface FileAttachmentProps {
  file: {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
    provider: string;
  };
}

export function FileAttachment({ file }: FileAttachmentProps) {
  const isImage = file.mimeType.startsWith("image/");

  return (
    <Card className="bg-[#2f2f2f] border-white/10 mb-2 max-w-sm">
      <CardContent className="p-3">
        {isImage ? (
          <div className="space-y-2">
            <img
              src={file.url || "/placeholder.svg"}
              alt={file.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{getFileIcon(file.mimeType)}</span>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-white/50 text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 p-1"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {file.name}
                </p>
                <p className="text-white/50 text-xs">
                  {formatFileSize(file.size)} • {file.provider}
                </p>
              </div>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 p-1 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
