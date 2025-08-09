// type SidebarProps = {
//     open: boolean;
//     onToggle: () => void;
// };

// export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
//     return (
//         <aside
//             style={{ width: open ? "16rem" : "2rem" }}
//             className={`h-screen ${open ? "bg-blue-700" : "bg-blue-900"} 
//                     text-white transition-all duration-300 ease-in-out overflow-hidden relative`}
//         >
//             {/* ハンドル */}
//             <button
//                 onClick={onToggle}
//                 className="absolute top-4 right-[5px] bg-blue-500 text-white p-1 rounded shadow"
//             >
//                 {open ? "◀" : "▶"}
//             </button>

//             {open && (
//                 <div className="p-4 mt-12">
//                     <h2 className="text-xl font-bold mb-4">メニュー</h2>
//                     <ul className="space-y-2">
//                         <li><button className="w-full text-left">チャット</button></li>
//                         <li><button className="w-full text-left">設定</button></li>
//                     </ul>
//                 </div>
//             )}
//         </aside>
//     );
// };

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, MessageSquare, Settings } from "lucide-react"

type SidebarProps = {
    open: boolean
    onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
    return (
        <aside
            style={{ width: open ? "16rem" : "2.5rem" }}
            className="h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden relative"
        >
            {/* トグルボタン */}
            <Button
                size="icon"
                variant="secondary"
                onClick={onToggle}
                className="absolute top-4 right-1"
            >
                {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>

            {open && (
                <div className="mt-14">
                    <div className="px-4">
                        <h2 className="text-xl font-bold mb-4">メニュー</h2>
                    </div>
                    <Separator />
                    <ScrollArea className="h-[calc(100vh-6rem)] px-2">
                        <Button variant="ghost" className="w-full justify-start gap-2 mb-1">
                            <MessageSquare className="h-4 w-4" /> チャット
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="h-4 w-4" /> 設定
                        </Button>
                    </ScrollArea>
                </div>
            )}
        </aside>
    )
}