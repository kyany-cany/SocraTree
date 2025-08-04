type SidebarProps = {
    open: boolean;
    onToggle: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
    return (
        <aside
            style={{ width: open ? "16rem" : "2rem" }}
            className={`h-screen ${open ? "bg-blue-700" : "bg-blue-900"} 
                    text-white transition-all duration-300 ease-in-out overflow-hidden relative`}
        >
            {/* ハンドル */}
            <button
                onClick={onToggle}
                className="absolute top-4 right-[5px] bg-blue-500 text-white p-1 rounded shadow"
            >
                {open ? "◀" : "▶"}
            </button>

            {open && (
                <div className="p-4 mt-12">
                    <h2 className="text-xl font-bold mb-4">メニュー</h2>
                    <ul className="space-y-2">
                        <li><button className="w-full text-left">チャット</button></li>
                        <li><button className="w-full text-left">設定</button></li>
                    </ul>
                </div>
            )}
        </aside>
    );
};
