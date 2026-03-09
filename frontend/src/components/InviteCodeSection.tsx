import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateInviteCode } from "../hooks/useQueries";

export function InviteCodeSection({ familyId }: { familyId: bigint }) {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutate: generateCode, isPending } = useGenerateInviteCode();

  const handleGenerate = () => {
    generateCode(
      { familyId },
      {
        onSuccess: (newCode) => {
          setCode(newCode);
          setCopied(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to generate invite code");
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Invite Code</h3>
        <p className="text-xs text-muted-foreground">
          Generate a code to invite someone to your family.
        </p>
      </div>
      {code ? (
        <div className="flex items-center gap-2">
          <Input
            value={code}
            readOnly
            className="font-mono text-center tracking-widest"
          />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Generating..." : "Generate Invite Code"}
        </Button>
      )}
      {code && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Generate New Code
        </Button>
      )}
    </div>
  );
}
