import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Loads the tool row id, logs a usage record once per mount for authed users,
// and exposes a favorite toggle button.
export function ToolActions({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [toolId, setToolId] = useState<number | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: tool } = await supabase.from("tools").select("id").eq("slug", slug).maybeSingle();
      if (cancelled || !tool) return;
      setToolId(tool.id as number);
      if (!user) return;
      // Log a "view/use" record (best-effort; ignored if RLS blocks)
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        tool_id: tool.id,
        credits_used: 0,
        status: "success",
      });
      const { data: fav } = await supabase
        .from("favorite_tools")
        .select("tool_id")
        .eq("user_id", user.id)
        .eq("tool_id", tool.id)
        .maybeSingle();
      if (!cancelled) setFavorited(!!fav);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id]);

  const toggle = async () => {
    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }
    if (!toolId) return;
    setBusy(true);
    try {
      if (favorited) {
        await supabase.from("favorite_tools").delete().eq("user_id", user.id).eq("tool_id", toolId);
        setFavorited(false);
      } else {
        await supabase.from("favorite_tools").insert({ user_id: user.id, tool_id: toolId });
        setFavorited(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
      <span className="ml-2">{favorited ? "Favorited" : "Favorite"}</span>
    </Button>
  );
}