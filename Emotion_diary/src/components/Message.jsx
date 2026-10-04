const Message = () => {
  const msg = new URLSearchParams(window.location.search).get("msg");
  return <div dangerouslySetInnerHTML={{ __html: msg }} />;
};

export default Message;