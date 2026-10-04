import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";

const Message = () => {
  const [params] = useSearchParams();
  const msg = params.get("msg") ?? "";

  
  const safeHtml = useMemo(
    () => DOMPurify.sanitize(msg, { USE_PROFILES: { html: true } }),
    [msg]
  );

  return (
    <div className="Message" dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
};

export default Message;
