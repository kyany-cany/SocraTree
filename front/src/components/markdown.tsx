import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// textだけ受け取って、内部で設定完結
type Props = { text: string };

const components: Components = {
    code({ className, children, ...props }) {
        const [copied, setCopied] = React.useState(false);

        // childrenを文字列に変換する関数
        const extractText = (node: React.ReactNode): string => {
            if (typeof node === 'string') return node;
            if (typeof node === 'number') return String(node);
            if (Array.isArray(node)) return node.map(extractText).join('');
            if (node && typeof node === 'object' && 'props' in node) {
                return extractText((node as { props: { children?: React.ReactNode } }).props.children);
            }
            return '';
        };

        const codeText = extractText(children);

        const handleCopy = () => {
            navigator.clipboard.writeText(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        };

        return (
            <div className="relative group my-3">
                <button
                    onClick={handleCopy}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition text-xs border px-2 py-1 rounded bg-secondary/80 hover:bg-secondary"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4">
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        );
    },
    a: ({ node, ...props }) => (
        <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
    h1: ({ node, ...props }) => <h1 {...props} className="m-0" />,
    h2: ({ node, ...props }) => <h2 {...props} className="m-0" />,
    h3: ({ node, ...props }) => <h3 {...props} className="m-0" />,
};

const MarkdownMessage: React.FC<Props> = ({ text }) => {
    return (
        <div className="prose prose-invert prose-pre:p-0 prose-pre:bg-transparent max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={components}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownMessage;
