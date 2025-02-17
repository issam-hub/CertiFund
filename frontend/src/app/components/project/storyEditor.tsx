"use client"
import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { TOAST_ERROR_TITLE } from '@/lib/constants';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse'>Loading editor...</p>
});

export default function StoryEditor() {
  const editorRef = useRef<any>(null);
  const { toast } = useToast()
  const MAX_FILE_SIZE = 300 * 1024; // 300KB in bytes

  useEffect(() => {
    // Function to find the DialogContent
    const findDialogContent = (element: HTMLElement | null): HTMLElement | null => {
      while (element && !element.classList.contains('tox-dialog') && element.parentElement) {
        element = element.parentElement;
      }
      return element;
    };

    const handleFocusin = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the target is within TinyMCE elements
      if (target.closest('.tox-tinymce, .tox-tinymce-aux, .moxman-window, .tam-assetmanager-root')) {
        e.stopImmediatePropagation();
        
        // Find the dialog content element
        const dialogContent = findDialogContent(target);
        if (dialogContent) {
          // Temporarily disable focus trap
          const dialogParent = dialogContent.parentElement;
          if (dialogParent) {
            dialogParent.setAttribute('data-focus-trap-disabled', 'true');
            
            // Re-enable focus trap after interaction
            const handleBlur = () => {
              dialogParent.removeAttribute('data-focus-trap-disabled');
              target.removeEventListener('blur', handleBlur);
            };
            target.addEventListener('blur', handleBlur);
          }
        }
      }
    };

    document.addEventListener('focusin', handleFocusin, true);
    
    return () => {
      document.removeEventListener('focusin', handleFocusin, true);
    };
  }, []);

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  return (
    <div className="relative">
      <Editor
        apiKey="351adhux0avyakjzrmlur3jiadngkc59py6agbcrhyy6bmbg"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          
          // Add custom class to TinyMCE dialogs to ensure proper z-index
          const customStyles = document.createElement('style');
          customStyles.innerHTML = `
            .tox-dialog-wrap {
              z-index: 1000000 !important;
            }
            .tox-dialog {
              z-index: 1000001 !important;
            }
            .tox-dialog__header {
              z-index: 1000002 !important;
            }
            .tox-dialog__footer {
              z-index: 1000002 !important;
            }
            .tox-dialog__body {
              z-index: 1000002 !important;
            }
            .tox-dialog-wrap__backdrop {
              z-index: 1000000 !important;
            }
          `;
          document.head.appendChild(customStyles);
          
          return () => {
            customStyles.remove();
          };
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
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | image link | help",

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