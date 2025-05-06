"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { addWordToFolder } from "@/src/lib/actions/wordActions"; // API経由のみに統一
import { useUser } from "@clerk/nextjs";

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (korean: string, japanese: string) => void; // ← 後で使わなくてもOKだけど今は置いておく
  list: string | null;
}

export default function AddWordDialog({
  open,
  onOpenChange,
  onSave,
  list,
}: AddWordDialogProps) {
  const [korean, setKorean] = useState("");
  const [japanese, setJapanese] = useState("");
  const [hasTranslated, setHasTranslated] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>単語を追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="韓国語"
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
          />
          <Input
            placeholder="日本語"
            value={japanese}
            onChange={(e) => setJapanese(e.target.value)}
          />
        </div>
        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleSaveAndContinue}>
            連続追加
          </Button>
          <Button className="bg-green-600 text-white" onClick={handleSave}>
            保存して閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
