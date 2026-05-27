import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatCode } from '../lib/utils';

interface FormattedHighlighterProps {
  children: string;
  language: string;
  [key: string]: any;
}

export const FormattedHighlighter: React.FC<FormattedHighlighterProps> = ({ children, language, ...props }) => {
  const [formatted, setFormatted] = useState(children);

  useEffect(() => {
    let isMounted = true;
    
    // Set raw code first
    setFormatted(children);
    
    // Then attempt to format
    formatCode(children, language).then(res => {
      if (isMounted) setFormatted(res);
    });
    
    return () => { isMounted = false; };
  }, [children, language]);

  return (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language}
      customStyle={{
        background: 'transparent',
        padding: 0,
        margin: 0,
        fontSize: '0.8rem',
      }}
      {...props}
    >
      {formatted}
    </SyntaxHighlighter>
  );
};
