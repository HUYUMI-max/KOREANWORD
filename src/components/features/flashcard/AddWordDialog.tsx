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
import { Loader2, ArrowLeftRight } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import { useTranslation } from "@/src/hooks/useTranslation";

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
  const [translationDirection, setTranslationDirection] = useState<'ko-to-ja' | 'ja-to-ko'>('ja-to-ko');
  const { translate, isLoading: isTranslating } = useTranslation();

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
    try {
      const translatedText = await translate(text, sourceLang, targetLang);
      return translatedText;
    } catch (error) {
      console.error('翻訳エラー:', error);
      return text;
    }
  };

  const handleTranslate = async () => {
    if (translationDirection === 'ko-to-ja' && korean) {
      const translated = await translateText(korean, 'ko', 'ja');
      setJapanese(translated);
    } else if (translationDirection === 'ja-to-ko' && japanese) {
      const translated = await translateText(japanese, 'ja', 'ko');
      setKorean(translated);
    }
  };

  const toggleTranslationDirection = () => {
    setTranslationDirection(prev => prev === 'ko-to-ja' ? 'ja-to-ko' : 'ko-to-ja');
  };

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
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="korean">韓国語</Label>
              {translationDirection === 'ko-to-ja' && (
                <span className="text-sm text-muted-foreground">翻訳元</span>
              )}
            </div>
            <Input
              id="korean"
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              placeholder="한국어"
              disabled={isAdding || isTranslating}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleTranslationDirection}
              disabled={isTranslating}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {translationDirection === 'ko-to-ja' ? '韓国語 → 日本語' : '日本語 → 韓国語'}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="japanese">日本語</Label>
              {translationDirection === 'ja-to-ko' && (
                <span className="text-sm text-muted-foreground">翻訳元</span>
              )}
            </div>
            <Input
              id="japanese"
              value={japanese}
              onChange={(e) => setJapanese(e.target.value)}
              placeholder="にほんご"
              disabled={isAdding || isTranslating}
              autoComplete="off"
            />
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTranslate}
              disabled={isTranslating || (translationDirection === 'ko-to-ja' ? !korean : !japanese)}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  翻訳中...
                </>
              ) : (
                "翻訳"
              )}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={!korean || !japanese || isAdding || isTranslating}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  連続追加中...
                </>
              ) : (
                "連続追加"
              )}
            </Button>
            <Button
              type="submit"
              disabled={!korean || !japanese || isAdding || isTranslating}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  追加中...
                </>
              ) : (
                "追加して閉じる"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
