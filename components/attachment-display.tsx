"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Eye, FileText } from "lucide-react";
import {
  getFileIcon,
  getFileTypeLabel,
  formatFileSize,
} from "@/lib/file-utils";

interface AttachmentDisplayProps {
  attachment: {
    name?: string;
    contentType?: string;
    size?: number;
    url?: string;
  };
  className?: string;
}

export function AttachmentDisplay({
  attachment,
  className,
}: AttachmentDisplayProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!attachment.contentType || !attachment.url) return null;

  const isImage = attachment.contentType.startsWith("image/");
  const isPdf = attachment.contentType === "application/pdf";
  const isText = attachment.contentType.startsWith("text/");

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, "_blank");
    }
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={attachment.url || "/placeholder.svg"}
          alt={attachment.name}
          className="max-w-full max-h-[70vh] object-contain"
        />
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={`${attachment.url}#toolbar=0`}
          className="w-full h-[70vh]"
          title={attachment.name}
        />
      );
    }

    if (isText) {
      return (
        <div className="bg-gray-100 p-4 rounded-lg max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-2">Text file preview:</p>
          <iframe
            src={attachment.url}
            className="w-full h-96 border-0"
            title={attachment.name}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="w-16 h-16 mb-4" />
        <p>Preview not available for this file type</p>
        <Button onClick={handleDownload} className="mt-4">
          <Download className="w-4 h-4 mr-2" />
          Download to view
        </Button>
      </div>
    );
  };

  if (isImage) {
    return (
      <div className={className}>
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <img
              src={attachment.url || "/placeholder.svg"}
              alt={attachment.name}
              className="rounded-md w-40 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{attachment.name}</DialogTitle>
            </DialogHeader>
            {renderPreview()}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card className={`w-40 mb-3 ${className}`}>
      <CardContent className="p-3">
        <div className="flex flex-col items-center text-center">
          <div className="text-2xl mb-2">
            {getFileIcon(attachment.contentType)}
          </div>
          <p className="text-xs font-medium text-gray-900 truncate w-full mb-1">
            {attachment.name}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            {getFileTypeLabel(attachment.contentType)}
          </p>
          {attachment.size && (
            <p className="text-xs text-gray-400 mb-2">
              {formatFileSize(attachment.size)}
            </p>
          )}

          <div className="flex gap-1 w-full">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{attachment.name}</DialogTitle>
                </DialogHeader>
                {renderPreview()}
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex-1 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Get
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
