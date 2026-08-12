import React from "react";

export function highlightString(
  rawText: string,
  start: number,
  end: number,
  className: string
): React.ReactNode[] {
  if (start < 0 || end > rawText.length || start >= end) {
    return [rawText];
  }

  return [
    <React.Fragment key="1">{rawText.slice(0, start)}</React.Fragment>,
    <mark key="2" className={className}>{rawText.slice(start, end)}</mark>,
    <React.Fragment key="3">{rawText.slice(end)}</React.Fragment>
  ];
}

export function highlightMultipleStrings(
  rawText: string,
  highlights: { start: number; end: number; className: string }[]
): React.ReactNode[] {
  if (!highlights.length) return [rawText];

  // Sort by start offset
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  
  const result: React.ReactNode[] = [];
  let currentIndex = 0;

  sorted.forEach((hl, i) => {
    // If there's overlap, we just ignore the overlapping part for simplicity
    if (hl.start < currentIndex) return;

    if (hl.start > currentIndex) {
      result.push(<React.Fragment key={`text-${i}`}>{rawText.slice(currentIndex, hl.start)}</React.Fragment>);
    }

    result.push(
      <mark key={`mark-${i}`} className={hl.className}>
        {rawText.slice(hl.start, hl.end)}
      </mark>
    );

    currentIndex = hl.end;
  });

  if (currentIndex < rawText.length) {
    result.push(<React.Fragment key={`text-end`}>{rawText.slice(currentIndex)}</React.Fragment>);
  }

  return result;
}

// For Gapped/Cloze texts
export function renderGappedTextWithHighlights(
  rawText: string,
  highlights: { start: number; end: number; className: string }[]
): React.ReactNode[] {
  // First, we apply highlights to the string, yielding an array of ReactNodes (strings and <mark>s)
  const highlightedNodes = highlightMultipleStrings(rawText, highlights);

  // Next, we iterate over these nodes. If it's a string, we split it by [GAP-X].
  // If it's a <mark>, we also split its children by [GAP-X] just in case, though ideally users don't highlight gaps.
  const finalNodes: React.ReactNode[] = [];
  let globalKey = 0;

  const processString = (str: string, wrapper?: (content: React.ReactNode, key: number) => React.ReactNode) => {
    const parts = str.split(/(\[GAP-\d+\])/);
    parts.forEach((p) => {
      if (p.startsWith("[GAP-") && p.endsWith("]")) {
        const num = p.match(/\d+/)?.[0];
        finalNodes.push(
          <span key={`gap-${globalKey++}`} className="inline-flex items-center justify-center min-w-[60px] h-8 mx-1 px-3 bg-muted border border-border rounded-md font-medium text-sm">
            {num}
          </span>
        );
      } else if (p.length > 0) {
        if (wrapper) {
          finalNodes.push(wrapper(p, globalKey++));
        } else {
          finalNodes.push(<span key={`text-${globalKey++}`} className="whitespace-pre-wrap">{p}</span>);
        }
      }
    });
  };

  highlightedNodes.forEach((node) => {
    if (typeof node === 'string') {
      processString(node);
    } else if (React.isValidElement(node) && node.type === React.Fragment) {
      processString(node.props.children as string);
    } else if (React.isValidElement(node) && node.type === 'mark') {
      processString(node.props.children as string, (content, key) => (
        <mark key={`mark-wrap-${key}`} className={node.props.className}>
          {content}
        </mark>
      ));
    }
  });

  return finalNodes;
}
