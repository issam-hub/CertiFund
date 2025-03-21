"use client"
import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { TOAST_ERROR_TITLE } from '@/app/_lib/constants';
import { apiKey } from '@/app/_lib/config';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse'>Loading editor...</p>
});

export default function StoryEditor({defaultvalue,onGetContent,disableEdit }:{defaultvalue:string,onGetContent:(getContent: () => string) => void, disableEdit: boolean}) {
  const editorRef = useRef<any>(null);
  const { toast } = useToast()
  const MAX_FILE_SIZE = 300 * 1024; // 300KB in bytes
  
  const getContent = () => {
    if (editorRef.current) {
      return editorRef.current.getContent();
    }
    return '';
  };

  // Expose the getContent function to parent
  useEffect(() => {
    onGetContent(getContent);
  }, [onGetContent]);

  return (
    <div className="relative">
      <Editor
        disabled={disableEdit}
        apiKey={apiKey}
        initialValue={defaultvalue || `Start writing the project story here...`}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          
        }}
        init={{
          height: 500, // Reduced height to better fit in dialog
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "table",
            "code",
            "help",
            "wordcount",
            "emoticons",
            "accordion",
          ],
          toolbar:
            "undo redo fullscreen preview | blocks fontfamily fontsize | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | bullist numlist outdent indent accordion | " +
            "removeformat | image link emoticons | help",

          inline: false,
          toolbar_sticky: true,
          
          ui_mode: 'split',
          skin: 'oxide',

          // Position settings for dialog context
          fixed_toolbar_container: undefined,
          toolbar_location: 'top',

          automatic_uploads: true,
          file_picker_types: "image",
          file_picker_callback: (cb, value, meta) => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");

            input.addEventListener("change", (e: Event) => {
              const target = e.target as HTMLInputElement;
              const file = target.files?.[0];
              
              if (!file) return;

              if (file.size > MAX_FILE_SIZE) {
                toast({
                  title: TOAST_ERROR_TITLE,
                  description: `File is too large. Maximum size is 300KB. Your file is ${(file.size / 1024).toFixed(2)}KB`,
                  variant: "destructive",
                });
                return;
              }

              const reader = new FileReader();
              reader.addEventListener("load", () => {
                const result = reader.result;
                if (typeof result !== 'string') return;
                
                const id = "blobid" + new Date().getTime();
                const blobCache = editorRef.current.editorUpload.blobCache;
                const base64 = result.split(",")[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name });
              });
              reader.readAsDataURL(file);
            });

            input.click();
          },
          content_style: `
            body { 
              font-family: Helvetica, Arial, sans-serif; 
              font-size: 14px;
            }
          `,
        }}
      />
    </div>
  );
}