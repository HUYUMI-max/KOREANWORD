// src/app/(dashboard)/layout.tsx  ← Server Component（"use client" なし）
// import { ClerkProvider, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
// import AppShell from "@/src/components/layouts/AppShell"; // ← "use client" が付いていて OK

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ClerkProvider>
//       <SignedOut>
//         {/* ログイン前にサインインボタンだけ表示 */}
//         <div className="flex h-screen items-center justify-center">
//           <SignInButton />
//         </div>
//       </SignedOut>

//       <SignedIn>
//         {/* Client Component である AppShell を Server Layout 内でラップ */}
//         <AppShell>{children}</AppShell>
//       </SignedIn>
//     </ClerkProvider>
//   );
// }

export default function DashboardLayout() {
    // まだ実装しないので空返却
    return null;
}