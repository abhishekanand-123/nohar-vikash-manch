import { lazy, Suspense } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
}

const TinyMceEditor = lazy(() => import("./TinyMceEditor"));

export default function RichTextEditor(props: RichTextEditorProps) {
  const minHeight = props.minHeight ?? "180px";

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center rounded-xl border border-input bg-muted/30 text-sm text-muted-foreground"
          style={{ minHeight }}
        >
          TinyMCE editor लोड हो रहा है...
        </div>
      }
    >
      <TinyMceEditor {...props} />
    </Suspense>
  );
}
