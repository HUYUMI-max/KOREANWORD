// src/app/(dashboard)/folders/[folderName]/page.tsx
// import { auth } from "@clerk/nextjs/server";
// import { getWordsInFolder } from "../../../../lib/actions/word.server";

// type Props = { params: { folderName: string } };

// export default async function FolderDetail({ params }: Props) {
//   const { userId } = await auth();
//   if (!userId) return null;

//   const words = await getWordsInFolder(userId, params.folderName);

//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-xl font-semibold">{params.folderName}</h2>

//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Korean</th>
//             <th className="p-2 border">Japanese</th>
//           </tr>
//         </thead>
//         <tbody>
//           {words.map((w) => (
//             <tr key={w.id}>
//               <td className="p-2 border">{w.korean}</td>
//               <td className="p-2 border">{w.japanese}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

export default function FolderPage() {
    // まだ実装しないので空返却
    return null;
  }
