import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const CopyComponent = ({ text }: {text: string}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setOpen(true);

      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 2000);
    } catch (err: any) {
      toast.error("Failed to copy:", err);
    }
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger onClick={handleCopy} className="cursor-pointer">
        <Copy className="w-5 h-5" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Copied!" : "Copy"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default CopyComponent;
