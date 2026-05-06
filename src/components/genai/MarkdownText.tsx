'use client';

import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import { useNavigate } from '@tanstack/react-router';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

const PEGA_CASE_URL_PATTERN = /\/incidents\/([A-Z]+-\d+)/i;

const parseLocalCaseId = (href: string | undefined): string | null => {
  if (!href) return null;
  const match = href.match(PEGA_CASE_URL_PATTERN);
  return match ? match[1].toUpperCase() : null;
};

export const MarkdownText = () => {
  const navigate = useNavigate();
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ className, ...p }) => <p {...p} className={cn('mb-2 last:mb-0 leading-snug', className)} />,
        h1: ({ className, ...p }) => <h1 {...p} className={cn('mt-2 mb-1 text-base font-semibold', className)} />,
        h2: ({ className, ...p }) => <h2 {...p} className={cn('mt-2 mb-1 text-sm font-semibold', className)} />,
        h3: ({ className, ...p }) => <h3 {...p} className={cn('mt-1.5 mb-1 text-sm font-semibold', className)} />,
        ul: ({ className, ...p }) => <ul {...p} className={cn('mb-2 ml-4 list-disc space-y-0.5', className)} />,
        ol: ({ className, ...p }) => <ol {...p} className={cn('mb-2 ml-4 list-decimal space-y-0.5', className)} />,
        li: ({ className, ...p }) => <li {...p} className={cn('leading-snug', className)} />,
        strong: ({ className, ...p }) => <strong {...p} className={cn('font-semibold', className)} />,
        em: ({ className, ...p }) => <em {...p} className={cn('italic', className)} />,
        a: ({ className, href, ...p }) => {
          const caseId = parseLocalCaseId(href);
          if (caseId) {
            return (
              <a
                {...p}
                href={`/support/new/${caseId}`}
                className={cn('text-primary underline underline-offset-2', className)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate({ to: '/support/new/$caseId', params: { caseId } });
                }}
              />
            );
          }
          return <a {...p} href={href} className={cn('text-primary underline underline-offset-2', className)} target='_blank' rel='noreferrer' />;
        },
        code: ({ className, ...p }) => (
          <code {...p} className={cn('rounded bg-muted-foreground/15 px-1 py-0.5 text-[0.85em] font-mono', className)} />
        ),
        pre: ({ className, ...p }) => (
          <pre {...p} className={cn('mb-2 overflow-x-auto rounded bg-muted-foreground/10 p-2 text-xs font-mono', className)} />
        ),
        blockquote: ({ className, ...p }) => <blockquote {...p} className={cn('border-l-2 border-muted-foreground/30 pl-2 italic', className)} />,
        hr: ({ className, ...p }) => <hr {...p} className={cn('my-2 border-muted-foreground/20', className)} />,
        table: ({ className, ...p }) => <table {...p} className={cn('mb-2 w-full text-xs border-collapse', className)} />,
        th: ({ className, ...p }) => <th {...p} className={cn('border border-muted-foreground/20 px-1.5 py-1 text-left font-semibold', className)} />,
        td: ({ className, ...p }) => <td {...p} className={cn('border border-muted-foreground/20 px-1.5 py-1', className)} />
      }}
    />
  );
};
