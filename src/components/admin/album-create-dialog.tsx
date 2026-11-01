"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveAlbum } from "@/actions/albums";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { formatDate } from "@/lib/utils";
import { Field } from "./field";

export function AlbumCreateDialog({ events }: { events: { id: string; title: string; start_at: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventId, setEventId] = useState("");

  function pickEvent(id: string) {
    setEventId(id);
    const ev = events.find((e) => e.id === id);
    if (ev) {
      if (!title) setTitle(ev.title);
      setDate(ev.start_at.slice(0, 10));
    }
  }

  function create() {
    start(async () => {
      const res = await saveAlbum({ title, description: "", album_date: date, event_id: eventId, cover_url: "", is_published: false });
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setOpen(false);
      router.push(`/admin/galeria/${res.data!.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Novo álbum
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo álbum</DialogTitle>
          <DialogDescription>Depois de criar, você poderá enviar as fotos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {events.length > 0 && (
            <Field label="Associar a um evento (opcional)" htmlFor="ev">
              <NativeSelect id="ev" value={eventId} onChange={(e) => pickEvent(e.target.value)}>
                <option value="">— Nenhum —</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({formatDate(e.start_at, { day: "2-digit", month: "2-digit", year: "numeric" })})
                  </option>
                ))}
              </NativeSelect>
            </Field>
          )}
          <Field label="Título *" htmlFor="t">
            <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Conferência 2026" />
          </Field>
          <Field label="Data" htmlFor="d">
            <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button onClick={create} disabled={pending || title.trim().length < 2}>
            {pending && <Loader2 className="animate-spin" />} Criar álbum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
