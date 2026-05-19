import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

export default function ResumeUploads() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Replace with your actual upload logic (e.g., to S3 or backend)
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setResumeUrl(data.url);
    setUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeUrl ? (
          <div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Current Resume
            </a>
            <Button
              variant="outline"
              onClick={() => setResumeUrl(null)}
              className="ml-4"
            >
              Replace
            </Button>
          </div>
        ) : (
          <div>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
