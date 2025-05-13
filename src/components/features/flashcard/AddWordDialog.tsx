"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { addWordToFolder } from "@/src/lib/actions/wordActions"; // API経由のみに統一
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Label } from "@/src/components/ui/label";

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (korean: string, japanese: string) => Promise<void>;
  list: string | null;
  isAdding?: boolean;
}

export default function AddWordDialog({
  open,
  onOpenChange,
  onSave,
  list,
  isAdding = false,
}: AddWordDialogProps) {
  const [korean, setKorean] = useState("");
  const [japanese, setJapanese] = useState("");
  const [hasTranslated, setHasTranslated] = useState(false);
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState([]);

  const { user } = useUser();

  const handleSave = async () => {
    if (!list || (!korean.trim() && !japanese.trim())) return;

    if (!user) {
      console.error("ユーザーが未ログインです");
      return;
    }

    const newWord = {
      korean: korean.trim(),
      japanese: japanese.trim(),
    };

    try {
      await addWordToFolder(list, newWord);
      console.log("API経由で保存完了");

      resetFields();
      onOpenChange(false);
    } catch (error) {
      console.error("単語追加失敗:", error);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!list || (!korean.trim() && !japanese.trim())) return;

    if (!user) {
      console.error("ユーザーが未ログインです");
      return;
    }

    const newWord = {
      korean: korean.trim(),
      japanese: japanese.trim(),
    };

    try {
      await addWordToFolder(list, newWord);
      console.log("API経由で保存完了 (連続追加)");

      resetFields();
    } catch (error) {
      console.error("単語追加失敗 (連続追加):", error);
    }
  };

  const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    return `（${targetLang}に翻訳）${text}`;
  };

  useEffect(() => {
    if (korean && !japanese && !hasTranslated) {
      translateText(korean, "ko", "ja").then((result) => {
        setJapanese(result);
        setHasTranslated(true);
      });
    }
  }, [korean]);

  useEffect(() => {
    if (japanese && !korean && !hasTranslated) {
      translateText(japanese, "ja", "ko").then((result) => {
        setKorean(result);
        setHasTranslated(true);
      });
    }
  }, [japanese]);

  useEffect(() => {
    if (open) {
      resetFields();
    }
  }, [open]);

  const resetFields = () => {
    setKorean("");
    setJapanese("");
    setHasTranslated(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>単語を追加</DialogTitle>
          <DialogDescription>
            韓国語と日本語の単語を入力してください
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="korean">韓国語</Label>
            <Input
              id="korean"
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              placeholder="한국어"
              disabled={isAdding}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="japanese">日本語</Label>
            <Input
              id="japanese"
              value={japanese}
              onChange={(e) => setJapanese(e.target.value)}
              placeholder="にほんご"
              disabled={isAdding}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!korean || !japanese || isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  追加中...
                </>
              ) : (
                "追加"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
