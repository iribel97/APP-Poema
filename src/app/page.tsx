'use client';

import { generatePoemFromImage } from '@/ai/flows/generate-poem-from-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useCallback } from 'react';
import { Copy, Download, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const generatePoem = async () => {
    if (!photo) {
      toast({
        title: 'Please upload a photo first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generatePoemFromImage({ photoUrl: photo });
      setPoem(result.poem);
    } catch (error: any) {
      toast({
        title: 'Error generating poem.',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPoem = () => {
    if (!poem) {
      toast({
        title: 'No poem to download.',
        variant: 'destructive',
      });
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([poem], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "poem.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const copyPoem = () => {
    if (!poem) {
      toast({
        title: 'No poem to copy.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(poem);
    toast({
      title: 'Poem copied to clipboard.',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Poemify</CardTitle>
          <CardDescription>Upload a photo and let AI generate a poem for you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            {photo ? (
              <img src={photo} alt="Uploaded" className="max-w-full max-h-48 rounded-md object-contain mb-4" />
            ) : (
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                </div>
              </label>
            )}
            <Input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <Button onClick={generatePoem} disabled={loading}>
            {loading ? "Generating..." : "Generate Poem"}
          </Button>
          {poem && (
            <div className="flex flex-col space-y-2">
              <Textarea readOnly value={poem} className="resize-none" />
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" size="sm" onClick={copyPoem}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="secondary" size="sm" onClick={downloadPoem}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


    