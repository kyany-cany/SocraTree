import { useAuth } from "../lib/auth_provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, MessageSquare, Settings } from "lucide-react"

type SidebarProps = {
    open: boolean
    onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
    const { signOut } = useAuth()
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
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={signOut}
                        >
                            <Settings className="h-4 w-4" /> ログアウト
                        </Button>
                    </ScrollArea>
                </div>
            )}
        </aside>
    )
}