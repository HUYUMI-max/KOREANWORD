export default function Footer() {
  return (
    <footer className="border-t py-6 md:px-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 韓国語フラッシュカード. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/terms" className="hover:underline">利用規約</a>
          <a href="/privacy" className="hover:underline">プライバシーポリシー</a>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </footer>
  )
}