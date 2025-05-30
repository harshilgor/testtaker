
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string | null) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('question-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('question-images')
        .getPublicUrl(data.path);

      onImageUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUpload(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || disabled}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || disabled}
            className="cursor-pointer"
            asChild
          >
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
          </Button>
        </label>
        
        {currentImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {currentImageUrl && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <ImageIcon className="h-5 w-5 text-gray-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Current image:</p>
              <img
                src={currentImageUrl}
                alt="Question image"
                className="max-w-full h-auto max-h-64 rounded border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
