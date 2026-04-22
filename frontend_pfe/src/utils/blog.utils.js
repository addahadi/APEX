/**
 * Checks if the content is a Lexical JSON string
 */
export const isLexicalJson = (content) => {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return parsed?.root !== undefined;
  } catch {
    return false;
  }
};

/**
 * Estimates reading time in minutes
 */
export const estimateReadTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  let text = "";
  
  if (isLexicalJson(content)) {
    try {
      const parsed = JSON.parse(content);
      // Simple text extraction from Lexical JSON (can be improved)
      const extractText = (node) => {
        let str = node.text || "";
        if (node.children) {
          node.children.forEach(child => {
            str += " " + extractText(child);
          });
        }
        return str;
      };
      text = extractText(parsed.root);
    } catch {
      text = String(content);
    }
  } else {
    text = String(content);
  }
  
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

/**
 * Formats ISO date to a readable format
 */
export const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
