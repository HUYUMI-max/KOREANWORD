// src/app/(dashboard)/page.tsx  ← Server Component
// import { auth } from "@clerk/nextjs/server";
// import { getFolders } from "../../lib/actions/folder.server";

// export default async function DashboardHome() {
//   const { userId } = await auth();
//   if (!userId) return null; // Layout 側の SignedOut がはじくので実際は来ない

//   const folders = await getFolders(userId);

//   return (
//     <div className="p-6 space-y-4">
//       <h1 className="text-2xl font-bold">フォルダ一覧</h1>
//       <ul className="space-y-2">
//         {folders.map((f) => (
//           <li key={f.id}>
//             <a href={`/folders/${encodeURIComponent(f.id)}`} className="text-blue-600 hover:underline">
//               {f.id}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

export default async function DashboardHome() {
    // まだ実装しないので空返却
    return null;
}
