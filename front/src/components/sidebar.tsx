import { useAuth } from "../lib/auth_provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, MessageSquare, Settings } from "lucide-react"
import type { Chat } from "@/types"
import { useEffect, useState } from "react"
import { apiGetJson } from "@/lib/api"

type SidebarProps = {
    open: boolean
    onToggle: () => void
    setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>
}

const dummyChats: Chat[] = [
    {
        id: "1",
        title: "チャット1",
        created_at: "2023-10-01T12:00:00Z",
        updated_at: "2023-10-01T12:00:00Z",
    },
    {
        id: "2",
        title: "チャット2",
        created_at: "2023-10-02T12:00:00Z",
        updated_at: "2023-10-02T12:00:00Z",
    },
]

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, setCurrentChat }) => {
    const { signOut } = useAuth()
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        (async () => {
            try {
                // const list = await apiGetJson<Chat[]>("/chats");
                // // 更新日時で新しい順に並べておく
                // list.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
                setChats(dummyChats);
            } finally {
            }
        })();
    }, []);

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
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 mb-1"
                            onClick={() => setCurrentChat(null)}
                        >
                            <MessageSquare className="h-4 w-4" /> チャット
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={signOut}
                        >
                            <Settings className="h-4 w-4" /> ログアウト
                        </Button>
                        <div className="px-2 pb-4 space-y-1">
                            {chats.map((c) => (
                                <Button
                                    key={c.id}
                                    variant="ghost"
                                    className="w-full justify-start truncate"
                                    onClick={() => setCurrentChat(c)}
                                    title={c.title}
                                >
                                    <span className="truncate">{c.title || "（無題）"}</span>
                                </Button>
                            ))}
                            {chats.length === 0 && (
                                <div className="text-xs text-muted-foreground px-2 py-3">
                                    チャットはまだありません
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </aside>
    )
}